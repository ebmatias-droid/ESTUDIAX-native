package app.estudiax.android

import android.app.Activity
import android.app.AlertDialog
import android.app.DatePickerDialog
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.graphics.Color
import android.graphics.Typeface
import android.view.Gravity
import android.widget.*
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class MainActivity : Activity() {
    private val prefs by lazy { getSharedPreferences("estudiax_local", MODE_PRIVATE) }
    private val tasks = mutableListOf<JSONObject>()
    private val cards = mutableListOf<JSONObject>()
    private lateinit var root: LinearLayout
    private lateinit var body: LinearLayout
    private var view = "tasks"
    private val bg = Color.rgb(12, 19, 32)
    private val panel = Color.rgb(20, 31, 49)
    private val fg = Color.rgb(239, 244, 255)
    private val muted = Color.rgb(155, 173, 200)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = bg
        window.navigationBarColor = bg
        // Recover gracefully if local preferences are interrupted or malformed.
        // Never crash the whole app while loading user-owned local study data.
        try {
            JSONArray(prefs.getString("tasks", "[]") ?: "[]").let { a -> for (i in 0 until a.length()) tasks.add(a.getJSONObject(i)) }
        } catch (_: Exception) {
            tasks.clear()
            prefs.edit().remove("tasks").apply()
        }
        try {
            JSONArray(prefs.getString("cards", "[]") ?: "[]").let { a -> for (i in 0 until a.length()) cards.add(a.getJSONObject(i)) }
        } catch (_: Exception) {
            cards.clear()
            prefs.edit().remove("cards").apply()
        }
        if (!prefs.getBoolean("accepted_terms_v1", false)) showConsent() else showHome()
    }

    private fun save() {
        val t = JSONArray(); tasks.forEach { t.put(it) }
        val c = JSONArray(); cards.forEach { c.put(it) }
        prefs.edit().putString("tasks", t.toString()).putString("cards", c.toString()).apply()
    }
    private fun text(s: String, size: Float = 16f, bold: Boolean = false) = TextView(this).apply {
        text = s; textSize = size; setTextColor(fg)
        if (bold) setTypeface(null, Typeface.BOLD)
        setPadding(0, 8, 0, 8)
    }
    private fun button(s: String, fn: () -> Unit) = Button(this).apply { text = s; setOnClickListener { fn() } }
    private fun input(s: String) = EditText(this).apply {
        hint = s; setHintTextColor(muted); setTextColor(fg); setSingleLine(true)
        setPadding(16, 10, 16, 10); setBackgroundColor(panel)
    }
    private fun column() = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL; setPadding(20, 18, 20, 22); setBackgroundColor(bg)
    }
    private fun start(title: String) {
        root = column()
        root.addView(text("📘 ESTUDIAX", 24f, true))
        root.addView(text(title, 21f, true))
        root.addView(text("Modo local · No necesita cuenta ni conexión", 12f).apply { setTextColor(muted) })
        setContentView(root)
    }

    private fun showConsent() {
        AlertDialog.Builder(this)
            .setTitle("Bienvenido a ESTUDIAX")
            .setMessage("Las tareas y tarjetas se guardan en este dispositivo. No se necesita una cuenta ni conexión para las funciones locales. La IA y Google Drive son servicios opcionales que solo se abren cuando tú los eliges. Al continuar aceptas los términos y el aviso de privacidad de ESTUDIAX.")
            .setCancelable(false)
            .setNegativeButton("Salir") { _, _ -> finish() }
            .setPositiveButton("Aceptar y continuar") { _, _ ->
                prefs.edit().putBoolean("accepted_terms_v1", true).apply()
                showHome()
            }.show()
    }

    private fun showHome() {
        view = "tasks"
        start("Tu espacio de estudio")
        val tabs = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER }
        listOf("Tareas" to "tasks", "Calendario" to "calendar", "Tarjetas" to "cards", "Progreso" to "progress", "Ajustes" to "settings").forEach { (label, id) ->
            tabs.addView(button(label) { view = id; renderView() }, LinearLayout.LayoutParams(0, -2, 1f))
        }
        root.addView(tabs)
        val scroll = ScrollView(this)
        body = column()
        scroll.addView(body)
        root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
        renderView()
    }

    private fun renderView() {
        body.removeAllViews()
        when (view) {
            "tasks" -> renderTasks()
            "calendar" -> renderCalendar()
            "cards" -> renderCards()
            "progress" -> renderProgress()
            else -> renderSettings()
        }
    }

    private fun renderTasks() {
        body.addView(text("Nueva tarea", 18f, true))
        val title = input("Nombre de la tarea"); body.addView(title)
        val subject = input("Materia"); body.addView(subject)
        val due = input("Fecha de entrega (opcional)")
        due.isFocusable = false
        due.isFocusableInTouchMode = false
        due.isClickable = true
        due.setOnClickListener {
            val now = Calendar.getInstance()
            DatePickerDialog(this, { _, year, month, day ->
                due.setText(String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day))
            }, now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DAY_OF_MONTH)).show()
        }
        body.addView(due)
        body.addView(button("Quitar fecha") { due.setText("") })
        body.addView(button("＋ Añadir tarea") {
            val v = title.text.toString().trim()
            if (v.isNotEmpty()) {
                val dueText = due.text.toString().trim()
                val validDue = dueText.isBlank() || try {
                    val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { isLenient = false }
                    parser.parse(dueText) != null
                } catch (_: Exception) { false }
                if (!validDue) {
                    due.error = "Selecciona una fecha válida"
                    return@button
                }
                tasks.add(JSONObject().put("id", java.util.UUID.randomUUID().toString()).put("title", v)
                    .put("subject", subject.text.toString().trim()).put("due", dueText).put("done", false))
                save(); scheduleReminder(tasks.last()); renderView()
            }
        })
        body.addView(button("Activar recordatorios locales") { requestReminderPermission() })
        body.addView(text("Mis tareas", 18f, true))
        if (tasks.isEmpty()) body.addView(text("Aún no tienes tareas.", 14f).apply { setTextColor(muted) })
        tasks.forEachIndexed { index, task ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
            val cb = CheckBox(this).apply {
                isChecked = task.optBoolean("done")
                setOnCheckedChangeListener { _, checked -> task.put("done", checked); save(); if (checked) cancelReminder(task) else scheduleReminder(task); renderView() }
            }
            row.addView(cb)
            row.addView(text(task.optString("title") + "\n" + task.optString("subject", "Sin materia") +
                (if (task.optString("due").isNotBlank()) "\nEntrega: " + task.optString("due") else ""), 14f),
                LinearLayout.LayoutParams(0, -2, 1f))
            row.addView(button("×") { cancelReminder(task); tasks.removeAt(index); save(); renderView() })
            body.addView(row)
        }
    }

    private fun renderCalendar() {
        body.addView(text("Próximas entregas", 18f, true))
        val upcoming = tasks.filter { it.optString("due").isNotBlank() && !it.optBoolean("done") }.sortedBy { it.optString("due") }
        if (upcoming.isEmpty()) body.addView(text("Todavía no hay entregas fechadas. Añade una fecha desde Tareas.", 14f).apply { setTextColor(muted) })
        upcoming.forEach { body.addView(text("📅 ${it.optString("due")} · ${it.optString("title")}\n${it.optString("subject")}", 15f)) }
        body.addView(text("Todos estos datos se guardan solo en el dispositivo.", 12f).apply { setTextColor(muted) })
    }

    private fun renderCards() {
        body.addView(text("Crear tarjeta", 18f, true))
        val front = input("Pregunta o concepto"); body.addView(front)
        val back = input("Respuesta"); body.addView(back)
        body.addView(button("Guardar tarjeta") {
            val q = front.text.toString().trim(); val a = back.text.toString().trim()
            if (q.isNotEmpty() && a.isNotEmpty()) {
                cards.add(JSONObject().put("id", System.currentTimeMillis().toString()).put("front", q).put("back", a))
                save(); renderView()
            }
        })
        body.addView(text("Mi mazo", 18f, true))
        cards.forEachIndexed { index, card ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(0, 10, 0, 10) }
            row.addView(text(card.optString("front"), 16f, true))
            val answer = text(card.optString("back"), 14f).apply { setTextColor(muted); visibility = android.view.View.GONE }
            row.addView(answer)
            row.addView(button("Ver / ocultar respuesta") { answer.visibility = if (answer.visibility == android.view.View.VISIBLE) android.view.View.GONE else android.view.View.VISIBLE })
            row.addView(button("Eliminar tarjeta") { cards.removeAt(index); save(); renderView() })
            body.addView(row)
        }
    }

    private fun renderProgress() {
        val done = tasks.count { it.optBoolean("done") }
        body.addView(text("Tareas completadas: $done de ${tasks.size}", 20f, true))
        body.addView(ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = maxOf(tasks.size, 1); progress = done
        })
        body.addView(text("Tarjetas creadas: ${cards.size}", 16f))
        body.addView(text("El progreso se calcula localmente.", 13f).apply { setTextColor(muted) })
    }


    private fun requestReminderPermission() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 4102)
        } else {
            tasks.filter { !it.optBoolean("done") }.forEach { scheduleReminder(it) }
            Toast.makeText(this, "Recordatorios locales activados", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 4102 && grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
            tasks.filter { !it.optBoolean("done") }.forEach { scheduleReminder(it) }
            Toast.makeText(this, "Recordatorios locales activados", Toast.LENGTH_SHORT).show()
        }
    }

    private fun scheduleReminder(task: JSONObject) {
        if (task.optBoolean("done")) return
        val due = task.optString("due")
        if (due.isBlank()) return
        val parsed = try { SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { isLenient = false }.parse(due) } catch (_: Exception) { null } ?: return
        val reminder = Calendar.getInstance().apply {
            time = parsed
            add(Calendar.DAY_OF_MONTH, -1)
            set(Calendar.HOUR_OF_DAY, 9); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        if (reminder.timeInMillis <= System.currentTimeMillis()) return
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        val intent = Intent(this, ReminderReceiver::class.java).putExtra("title", task.optString("title"))
        val code = task.optString("id").hashCode()
        val pending = PendingIntent.getBroadcast(this, code, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val alarm = getSystemService(ALARM_SERVICE) as AlarmManager
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminder.timeInMillis, pending)
    }

    private fun cancelReminder(task: JSONObject) {
        val intent = Intent(this, ReminderReceiver::class.java)
        val pending = PendingIntent.getBroadcast(this, task.optString("id").hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        (getSystemService(ALARM_SERVICE) as AlarmManager).cancel(pending)
    }

    private fun renderSettings() {
        body.addView(text("Privacidad", 18f, true))
        body.addView(text("Sin cuenta obligatoria ni solicitudes de red al iniciar. Los datos de estudio permanecen en este dispositivo.", 14f).apply { setTextColor(muted) })
        body.addView(button("Exportar datos (JSON al portapapeles)") {
            val payload = JSONObject().put("tasks", JSONArray().also { a -> tasks.forEach { a.put(it) } })
                .put("cards", JSONArray().also { a -> cards.forEach { a.put(it) } })
            val clipboard = getSystemService(CLIPBOARD_SERVICE) as android.content.ClipboardManager
            clipboard.setPrimaryClip(android.content.ClipData.newPlainText("ESTUDIAX backup", payload.toString(2)))
            Toast.makeText(this, "Copia de seguridad copiada", Toast.LENGTH_SHORT).show()
        })
        body.addView(button("Borrar todos los datos locales") {
            AlertDialog.Builder(this).setTitle("Borrar datos")
                .setMessage("Esta acción elimina tus tareas y tarjetas de este dispositivo.")
                .setNegativeButton("Cancelar", null).setPositiveButton("Borrar") { _, _ ->
                    tasks.clear(); cards.clear(); save(); renderView()
                }.show()
        })
        body.addView(button("Activar recordatorios locales") { requestReminderPermission() })
        body.addView(text("Funciones en línea opcionales", 18f, true))
        body.addView(text("La IA y Google Drive se abren solo si tú pulsas uno de estos accesos. No se envían tareas automáticamente.", 13f).apply { setTextColor(muted) })
        body.addView(button("Abrir ESTUDIAX Web · IA y Google Drive") {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://estudiax.higgsfield.app")))
        })
        body.addView(button("Ver términos y privacidad") {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://estudiax.higgsfield.app/privacy")))
        })
    }
}
