package app.estudiax.android

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.graphics.Typeface
import android.view.Gravity
import android.widget.*
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : Activity() {
    private val prefs by lazy { getSharedPreferences("estudiax_local", MODE_PRIVATE) }
    private val tasks = mutableListOf<JSONObject>()
    private lateinit var root: LinearLayout
    private lateinit var body: LinearLayout
    private val bg = Color.rgb(12, 19, 32)
    private val panel = Color.rgb(20, 31, 49)
    private val fg = Color.rgb(239, 244, 255)
    private val muted = Color.rgb(155, 173, 200)
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); window.statusBarColor=bg;window.navigationBarColor=bg;val a=JSONArray(prefs.getString("tasks","[]")?:"[]");for(i in 0 until a.length())tasks.add(a.getJSONObject(i));showHome() }
    private fun save(){val a=JSONArray();tasks.forEach{a.put(it)};prefs.edit().putString("tasks",a.toString()).apply()}
    private fun text(s:String,size:Float=16f,bold:Boolean=false)=TextView(this).apply{text=s;textSize=size;setTextColor(fg);if(bold)setTypeface(null,Typeface.BOLD);setPadding(0,8,0,8)}
    private fun button(s:String,fn:()->Unit)=Button(this).apply{text=s;setOnClickListener{fn()}}
    private fun input(s:String)=EditText(this).apply{hint=s;setHintTextColor(muted);setTextColor(fg);setSingleLine(true);setPadding(16,10,16,10);setBackgroundColor(panel)}
    private fun column()=LinearLayout(this).apply{orientation=LinearLayout.VERTICAL;setPadding(20,18,20,22);setBackgroundColor(bg)}
    private fun start(title:String){root=column();root.addView(text("📘 ESTUDIAX",24f,true));root.addView(text(title,21f,true));root.addView(text("Modo local · No necesita cuenta ni conexión",12f).apply{setTextColor(muted)});setContentView(root)}
    private fun showHome(){start("Mis tareas");val tabs=LinearLayout(this).apply{orientation=LinearLayout.HORIZONTAL};tabs.addView(button("Tareas"){showHome()},LinearLayout.LayoutParams(0,-2,1f));tabs.addView(button("Calendario"){showCalendar()},LinearLayout.LayoutParams(0,-2,1f));tabs.addView(button("Progreso"){showProgress()},LinearLayout.LayoutParams(0,-2,1f));root.addView(tabs);val scroll=ScrollView(this);body=column();scroll.addView(body);root.addView(scroll,LinearLayout.LayoutParams(-1,0,1f));body.addView(text("Nueva tarea",18f,true));val title=input("Nombre de la tarea");body.addView(title);val subject=input("Materia");body.addView(subject);body.addView(button("＋ Añadir tarea"){val v=title.text.toString().trim();if(v.isNotEmpty()){tasks.add(JSONObject().put("title",v).put("subject",subject.text.toString()).put("done",false));save();showHome()}});body.addView(text("Lista",18f,true));if(tasks.isEmpty())body.addView(text("Aún no tienes tareas.",14f).apply{setTextColor(muted)});tasks.forEachIndexed{index,t->val row=LinearLayout(this).apply{orientation=LinearLayout.HORIZONTAL;gravity=Gravity.CENTER_VERTICAL};val cb=CheckBox(this).apply{isChecked=t.optBoolean("done");setOnCheckedChangeListener{_,v->t.put("done",v);save();showHome()}};row.addView(cb);row.addView(text(t.optString("title")+"\n"+t.optString("subject"),15f),LinearLayout.LayoutParams(0,-2,1f));row.addView(button("×"){tasks.removeAt(index);save();showHome()});body.addView(row)}}
    private fun showCalendar(){start("Calendario");root.addView(button("← Tareas"){showHome()});val today=java.text.SimpleDateFormat("yyyy-MM-dd",java.util.Locale.US).format(java.util.Date());val todayTasks=tasks.filter{it.optString("due")==today};root.addView(text("Entregas de hoy",18f,true));if(todayTasks.isEmpty())root.addView(text("No hay entregas registradas para hoy.",14f).apply{setTextColor(muted)}) else todayTasks.forEach{root.addView(text("• "+it.optString("title")))};root.addView(text("Añade fechas desde la versión web o de escritorio.",13f).apply{setTextColor(muted)})}
    private fun showProgress(){start("Progreso");root.addView(text("${tasks.count{it.optBoolean("done")}} de ${tasks.size} tareas completadas",20f,true));root.addView(button("← Tareas"){showHome()})}
}