import { useEffect, useRef, useState, type FormEvent } from "react";
import { askTutor } from "../lib/api/tutor.functions";
type Card = {
  id: string;
  subject: string;
  front: string;
  back: string;
  due: string;
  reviews: number;
};
type Q = { id: string; text: string; options: string[]; correct: number };
type Quiz = { id: string; title: string; subject: string; questions: Q[]; best?: number };
type Task = { done: boolean; subject: string; kind: string };
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
function read<T>(k: string, d: T): T {
  try {
    const x = localStorage.getItem(k);
    return x ? (JSON.parse(x) as T) : d;
  } catch {
    return d;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}
const zh: Record<string, string> = {
  "Actividades completadas por materia.": "各科目已完成的任务。",
  "Agrega actividades para ver el progreso.": "添加任务以查看进度。",
  "Agrega preguntas y selecciona la respuesta correcta.": "添加问题并选择正确答案。",
  "Agregar pregunta": "添加问题",
  "Apunte sin título": "无标题笔记",
  Apuntes: "笔记",
  "Apuntes guardados localmente en este navegador.": "笔记保存在此浏览器中。",
  Calificar: "评分",
  Comenzar: "开始",
  "Constructor de examen": "试卷编辑器",
  Correcta: "正确答案",
  "Crea preguntas de opción múltiple y califica tus respuestas.": "创建选择题并为答案评分。",
  "Crea un apunte para empezar.": "创建一条笔记以开始。",
  "Crea un examen con el formulario de al lado.": "使用旁边的表单创建考试。",
  "Crear tarjeta": "创建记忆卡",
  "Cuaderno digital": "数字笔记本",
  DESCANSO: "休息",
  Difícil: "有点难",
  "Ej. Leyes de Newton": "例如：牛顿定律",
  Eliminar: "删除",
  Empezar: "开始",
  "Escribe ideas, fórmulas y resúmenes…": "写下想法、公式和摘要…",
  "Estadísticas de aprendizaje": "学习统计",
  "Exámenes de práctica": "练习考试",
  Física: "物理",
  General: "综合",
  "Generando…": "正在生成…",
  "Guardar apunte": "保存笔记",
  "Guardar examen": "保存考试",
  "Guardar tarjeta": "保存记忆卡",
  "Herramientas usadas": "使用的工具",
  Historia: "历史",
  Inglés: "英语",
  "La sabía": "我答对了",
  "Los apuntes permanecen en este navegador.": "笔记仅保存在此浏览器中。",
  Matemáticas: "数学",
  Materia: "科目",
  "Mide tus hábitos, no solo el tiempo frente a la pantalla.":
    "衡量你的学习习惯，而不只是屏幕时间。",
  "Modo concentración": "专注模式",
  Nivel: "学习阶段",
  "No hay tarjetas pendientes. Crea una para empezar.": "没有待复习的卡片。创建一张卡片开始吧。",
  "Nuevo apunte": "新建笔记",
  Opción: "选项",
  "Otra vez": "再来一次",
  Pausar: "暂停",
  Pregunta: "问题",
  "Pregunta por delante, respuesta detrás.": "正面是问题，背面是答案。",
  "Preguntas de examen": "考试题目",
  Preparatoria: "高中",
  Programación: "编程",
  "Progreso por materia": "各科目进度",
  "Promedio de exámenes": "考试平均分",
  Práctica: "练习",
  Química: "化学",
  Reiniciar: "重置",
  "Repasa con repetición espaciada y recuerda activamente.": "通过间隔重复和主动回忆来复习。",
  "Repaso de hoy": "今日复习",
  Respuesta: "答案",
  Resultado: "结果",
  Secundaria: "初中",
  "Sesiones completadas": "已完成的专注时段",
  "Sesiones de enfoque": "专注时段",
  "Sin calificar": "尚未评分",
  "TIEMPO DE ESTUDIO": "学习时间",
  "Tareas completadas": "已完成任务",
  Tarjetas: "记忆卡",
  "Tarjetas de memoria": "记忆卡片",
  "Tema para generar un examen con IA": "用于 AI 生成考试的主题",
  "Toca para voltear": "点击翻面",
  "Tu actividad dentro de Estudiax.": "你在 Estudiax 中的学习活动。",
  "Tus exámenes": "你的考试",
  Título: "标题",
  "Una tarea a la vez, con descansos breves.": "一次专注一项任务，间隔短暂休息。",
  Universidad: "大学",
  Volver: "返回",
  completadas: "已完成",
  guardados: "已保存",
  intentos: "次尝试",
  "min de descanso": "分钟休息",
  "min de enfoque": "分钟专注",
  preguntas: "个问题",
  repasos: "次复习",
  "tarjetas guardadas": "张已保存卡片",
  "tarjetas pendientes": "张待复习卡片",
  "✳ Generar examen con IA": "✳ 使用 AI 生成考试",
};
const studyTranslations: Record<string, Record<string, string>> = {
  ja: {
    "Actividades completadas por materia.":"科目別の完了タスク。","Agrega actividades para ver el progreso.":"進捗を見るにはタスクを追加してください。","Agrega preguntas y selecciona la respuesta correcta.":"問題を追加して正しい答えを選択してください。","Agregar pregunta":"問題を追加","Apunte sin título":"無題のノート","Apuntes":"ノート","Apuntes guardados localmente en este navegador.":"ノートはこのブラウザーに保存されます。","Calificar":"採点","Comenzar":"開始","Constructor de examen":"テスト作成","Correcta":"正解","Crea preguntas de opción múltiple y califica tus respuestas.":"選択式の問題を作り、回答を採点します。","Crea un apunte para empezar.":"ノートを作成して始めましょう。","Crea un examen con el formulario de al lado.":"隣のフォームでテストを作成してください。","Crear tarjeta":"カードを作成","Cuaderno digital":"デジタルノート","DESCANSO":"休憩","Difícil":"難しい","Ej. Leyes de Newton":"例：ニュートンの法則","Eliminar":"削除","Empezar":"始める","Escribe ideas, fórmulas y resúmenes…":"アイデア、公式、要約を書きましょう…","Estadísticas de aprendizaje":"学習統計","Exámenes de práctica":"練習テスト","Física":"物理","General":"一般","Generando…":"作成中…","Guardar apunte":"ノートを保存","Guardar examen":"テストを保存","Guardar tarjeta":"カードを保存","Herramientas usadas":"使用したツール","Historia":"歴史","Inglés":"英語","La sabía":"知っていた","Los apuntes permanecen en este navegador.":"ノートはこのブラウザーに保存されます。","Matemáticas":"数学","Materia":"科目","Modo concentración":"集中モード","Nivel":"レベル","No hay tarjetas pendientes. Crea una para empezar.":"復習するカードはありません。作成して始めましょう。","Nuevo apunte":"新しいノート","Opción":"選択肢","Otra vez":"もう一度","Pausar":"一時停止","Pregunta":"問題","Pregunta por delante, respuesta detrás.":"表に問題、裏に答え。","Preguntas de examen":"テストの問題","Preparatoria":"高校","Programación":"プログラミング","Progreso por materia":"科目別の進捗","Promedio de exámenes":"テスト平均","Práctica":"練習","Química":"化学","Reiniciar":"リセット","Repasa con repetición espaciada y recuerda activamente.":"間隔反復と能動的な想起で復習しましょう。","Repaso de hoy":"今日の復習","Respuesta":"回答","Resultado":"結果","Secundaria":"中学校","Sesiones completadas":"完了したセッション","Sesiones de enfoque":"集中セッション","Sin calificar":"未採点","TIEMPO DE ESTUDIO":"学習時間","Tareas completadas":"完了したタスク","Tarjetas":"カード","Tarjetas de memoria":"暗記カード","Tema para generar un examen con IA":"AIテストのテーマ","Toca para voltear":"タップして裏返す","Tu actividad dentro de Estudiax.":"Estudiaxでの学習アクティビティ。","Tus exámenes":"あなたのテスト","Título":"タイトル","Una tarea a la vez, con descansos breves.":"短い休憩を挟みながら、一度に一つずつ。","Universidad":"大学","Volver":"戻る","completadas":"完了","guardados":"保存済み","intentos":"回の試行","min de descanso":"分の休憩","min de enfoque":"分の集中","preguntas":"問題","repasos":"復習","tarjetas guardadas":"保存済みカード","tarjetas pendientes":"復習待ちカード","✳ Generar examen con IA":"✳ AIでテストを作成"
  },
  ko: {
    "Actividades completadas por materia.":"과목별 완료 과제입니다.","Agrega actividades para ver el progreso.":"진행 상황을 보려면 과제를 추가하세요.","Agrega preguntas y selecciona la respuesta correcta.":"문제를 추가하고 정답을 선택하세요.","Agregar pregunta":"문제 추가","Apunte sin título":"제목 없는 노트","Apuntes":"노트","Apuntes guardados localmente en este navegador.":"노트는 이 브라우저에 저장됩니다.","Calificar":"채점","Comenzar":"시작","Constructor de examen":"시험 만들기","Correcta":"정답","Crea preguntas de opción múltiple y califica tus respuestas.":"객관식 문제를 만들고 답변을 채점하세요.","Crea un apunte para empezar.":"노트를 만들어 시작하세요.","Crea un examen con el formulario de al lado.":"옆의 양식으로 시험을 만드세요.","Crear tarjeta":"카드 만들기","Cuaderno digital":"디지털 노트","DESCANSO":"휴식","Difícil":"어려움","Ej. Leyes de Newton":"예: 뉴턴의 법칙","Eliminar":"삭제","Empezar":"시작하기","Escribe ideas, fórmulas y resúmenes…":"아이디어, 공식, 요약을 적어 보세요…","Estadísticas de aprendizaje":"학습 통계","Exámenes de práctica":"연습 시험","Física":"물리","General":"일반","Generando…":"생성 중…","Guardar apunte":"노트 저장","Guardar examen":"시험 저장","Guardar tarjeta":"카드 저장","Herramientas usadas":"사용한 도구","Historia":"역사","Inglés":"영어","La sabía":"알고 있었어요","Los apuntes permanecen en este navegador.":"노트는 이 브라우저에 저장됩니다.","Matemáticas":"수학","Materia":"과목","Modo concentración":"집중 모드","Nivel":"수준","No hay tarjetas pendientes. Crea una para empezar.":"복습할 카드가 없습니다. 카드를 만들어 시작하세요.","Nuevo apunte":"새 노트","Opción":"선택지","Otra vez":"다시","Pausar":"일시 정지","Pregunta":"질문","Pregunta por delante, respuesta detrás.":"앞면은 질문, 뒷면은 답변입니다.","Preguntas de examen":"시험 문제","Preparatoria":"고등학교","Programación":"프로그래밍","Progreso por materia":"과목별 진행 상황","Promedio de exámenes":"시험 평균","Práctica":"연습","Química":"화학","Reiniciar":"초기화","Repasa con repetición espaciada y recuerda activamente.":"간격 반복과 능동적 회상으로 복습하세요.","Repaso de hoy":"오늘의 복습","Respuesta":"답변","Resultado":"결과","Secundaria":"중학교","Sesiones completadas":"완료한 세션","Sesiones de enfoque":"집중 세션","Sin calificar":"채점되지 않음","TIEMPO DE ESTUDIO":"공부 시간","Tareas completadas":"완료한 과제","Tarjetas":"카드","Tarjetas de memoria":"암기 카드","Tema para generar un examen con IA":"AI 시험 주제","Toca para voltear":"눌러서 뒤집기","Tu actividad dentro de Estudiax.":"Estudiax 학습 활동입니다.","Tus exámenes":"내 시험","Título":"제목","Una tarea a la vez, con descansos breves.":"짧은 휴식을 곁들여 한 번에 하나씩 공부하세요.","Universidad":"대학교","Volver":"뒤로","completadas":"완료","guardados":"저장됨","intentos":"회 시도","min de descanso":"분 휴식","min de enfoque":"분 집중","preguntas":"문제","repasos":"복습","tarjetas guardadas":"저장된 카드","tarjetas pendientes":"복습할 카드","✳ Generar examen con IA":"✳ AI 시험 만들기"
  },
  fr: {
    "Actividades completadas por materia.":"Activités terminées par matière.","Agrega actividades para ver el progreso.":"Ajoutez des activités pour voir votre progression.","Agrega preguntas y selecciona la respuesta correcta.":"Ajoutez des questions et sélectionnez la bonne réponse.","Agregar pregunta":"Ajouter une question","Apunte sin título":"Note sans titre","Apuntes":"Notes","Apuntes guardados localmente en este navegador.":"Notes enregistrées localement dans ce navigateur.","Calificar":"Corriger","Comenzar":"Démarrer","Constructor de examen":"Créateur de quiz","Correcta":"Correcte","Crea preguntas de opción múltiple y califica tus respuestas.":"Créez des questions à choix multiples et évaluez vos réponses.","Crea un apunte para empezar.":"Créez une note pour commencer.","Crea un examen con el formulario de al lado.":"Créez un quiz avec le formulaire à côté.","Crear tarjeta":"Créer une fiche","Cuaderno digital":"Carnet numérique","DESCANSO":"PAUSE","Difícil":"Difficile","Ej. Leyes de Newton":"Ex. : lois de Newton","Eliminar":"Supprimer","Empezar":"Commencer","Escribe ideas, fórmulas y resúmenes…":"Écrivez des idées, des formules et des résumés…","Estadísticas de aprendizaje":"Statistiques d’apprentissage","Exámenes de práctica":"Examens d’entraînement","Física":"Physique","General":"Général","Generando…":"Génération…","Guardar apunte":"Enregistrer la note","Guardar examen":"Enregistrer le quiz","Guardar tarjeta":"Enregistrer la fiche","Herramientas usadas":"Outils utilisés","Historia":"Histoire","Inglés":"Anglais","La sabía":"Je la connaissais","Los apuntes permanecen en este navegador.":"Les notes restent dans ce navigateur.","Matemáticas":"Mathématiques","Materia":"Matière","Modo concentración":"Mode concentration","Nivel":"Niveau","No hay tarjetas pendientes. Crea una para empezar.":"Aucune fiche à réviser. Créez-en une pour commencer.","Nuevo apunte":"Nouvelle note","Opción":"Option","Otra vez":"Encore","Pausar":"Pause","Pregunta":"Question","Pregunta por delante, respuesta detrás.":"La question devant, la réponse derrière.","Preguntas de examen":"Questions du quiz","Preparatoria":"Lycée","Programación":"Programmation","Progreso por materia":"Progression par matière","Promedio de exámenes":"Moyenne des quiz","Práctica":"Entraînement","Química":"Chimie","Reiniciar":"Réinitialiser","Repasa con repetición espaciada y recuerda activamente.":"Révisez avec la répétition espacée et la mémorisation active.","Repaso de hoy":"Révision du jour","Respuesta":"Réponse","Resultado":"Résultat","Secundaria":"Collège","Sesiones completadas":"Sessions terminées","Sesiones de enfoque":"Sessions de concentration","Sin calificar":"Non corrigé","TIEMPO DE ESTUDIO":"TEMPS D’ÉTUDE","Tareas completadas":"Tâches terminées","Tarjetas":"Fiches","Tarjetas de memoria":"Fiches mémoire","Tema para generar un examen con IA":"Sujet du quiz généré par IA","Toca para voltear":"Touchez pour retourner","Tu actividad dentro de Estudiax.":"Votre activité dans Estudiax.","Tus exámenes":"Vos quiz","Título":"Titre","Una tarea a la vez, con descansos breves.":"Une tâche à la fois, avec de courtes pauses.","Universidad":"Université","Volver":"Retour","completadas":"terminées","guardados":"enregistrés","intentos":"tentatives","min de descanso":"min de pause","min de enfoque":"min de concentration","preguntas":"questions","repasos":"révisions","tarjetas guardadas":"fiches enregistrées","tarjetas pendientes":"fiches à réviser","✳ Generar examen con IA":"✳ Générer un quiz avec l’IA"
  },
  pt: {
    "Actividades completadas por materia.":"Atividades concluídas por matéria.","Agrega actividades para ver el progreso.":"Adicione atividades para ver seu progresso.","Agrega preguntas y selecciona la respuesta correcta.":"Adicione perguntas e selecione a resposta correta.","Agregar pregunta":"Adicionar pergunta","Apunte sin título":"Nota sem título","Apuntes":"Anotações","Apuntes guardados localmente en este navegador.":"Anotações salvas localmente neste navegador.","Calificar":"Corrigir","Comenzar":"Começar","Constructor de examen":"Criador de prova","Correcta":"Correta","Crea preguntas de opción múltiple y califica tus respuestas.":"Crie questões de múltipla escolha e corrija suas respostas.","Crea un apunte para empezar.":"Crie uma anotação para começar.","Crea un examen con el formulario de al lado.":"Crie uma prova usando o formulário ao lado.","Crear tarjeta":"Criar cartão","Cuaderno digital":"Caderno digital","DESCANSO":"DESCANSO","Difícil":"Difícil","Ej. Leyes de Newton":"Ex.: Leis de Newton","Eliminar":"Excluir","Empezar":"Iniciar","Escribe ideas, fórmulas y resúmenes…":"Escreva ideias, fórmulas e resumos…","Estadísticas de aprendizaje":"Estatísticas de aprendizagem","Exámenes de práctica":"Provas de prática","Física":"Física","General":"Geral","Generando…":"Gerando…","Guardar apunte":"Salvar anotação","Guardar examen":"Salvar prova","Guardar tarjeta":"Salvar cartão","Herramientas usadas":"Ferramentas usadas","Historia":"História","Inglés":"Inglês","La sabía":"Eu sabia","Los apuntes permanecen en este navegador.":"As anotações ficam neste navegador.","Matemáticas":"Matemática","Materia":"Matéria","Modo concentración":"Modo de concentração","Nivel":"Nível","No hay tarjetas pendientes. Crea una para empezar.":"Não há cartões para revisar. Crie um para começar.","Nuevo apunte":"Nova anotação","Opción":"Opção","Otra vez":"De novo","Pausar":"Pausar","Pregunta":"Pergunta","Pregunta por delante, respuesta detrás.":"Pergunta na frente, resposta atrás.","Preguntas de examen":"Questões da prova","Preparatoria":"Ensino médio","Programación":"Programação","Progreso por materia":"Progresso por matéria","Promedio de exámenes":"Média das provas","Práctica":"Prática","Química":"Química","Reiniciar":"Reiniciar","Repasa con repetición espaciada y recuerda activamente.":"Revise com repetição espaçada e recordação ativa.","Repaso de hoy":"Revisão de hoje","Respuesta":"Resposta","Resultado":"Resultado","Secundaria":"Ensino fundamental II","Sesiones completadas":"Sessões concluídas","Sesiones de enfoque":"Sessões de foco","Sin calificar":"Sem correção","TIEMPO DE ESTUDIO":"TEMPO DE ESTUDO","Tareas completadas":"Tarefas concluídas","Tarjetas":"Cartões","Tarjetas de memoria":"Cartões de memória","Tema para generar un examen con IA":"Tema para gerar uma prova com IA","Toca para voltear":"Toque para virar","Tu actividad dentro de Estudiax.":"Sua atividade no Estudiax.","Tus exámenes":"Suas provas","Título":"Título","Una tarea a la vez, con descansos breves.":"Uma tarefa por vez, com pausas curtas.","Universidad":"Universidade","Volver":"Voltar","completadas":"concluídas","guardados":"salvos","intentos":"tentativas","min de descanso":"min de descanso","min de enfoque":"min de foco","preguntas":"perguntas","repasos":"revisões","tarjetas guardadas":"cartões salvos","tarjetas pendientes":"cartões pendentes","✳ Generar examen con IA":"✳ Gerar prova com IA"
  },
  it: {
    "Apuntes":"Appunti","Calificar":"Valuta","Comenzar":"Inizia","Constructor de examen":"Crea quiz","Correcta":"Corretta","Crear tarjeta":"Crea scheda","Cuaderno digital":"Quaderno digitale","DESCANSO":"PAUSA","Difícil":"Difficile","Eliminar":"Elimina","Empezar":"Inizia","Estadísticas de aprendizaje":"Statistiche di apprendimento","Exámenes de práctica":"Quiz di esercitazione","Física":"Fisica","General":"Generale","Generando…":"Generazione…","Guardar apunte":"Salva appunto","Guardar examen":"Salva quiz","Guardar tarjeta":"Salva scheda","Historia":"Storia","Inglés":"Inglese","La sabía":"La sapevo","Matemáticas":"Matematica","Materia":"Materia","Modo concentración":"Modalità concentrazione","Nivel":"Livello","Nuevo apunte":"Nuovo appunto","Opción":"Opzione","Otra vez":"Di nuovo","Pausar":"Pausa","Pregunta":"Domanda","Preparatoria":"Scuola superiore","Programación":"Programmazione","Progreso por materia":"Progressi per materia","Promedio de exámenes":"Media dei quiz","Práctica":"Esercitazione","Química":"Chimica","Reiniciar":"Riavvia","Repaso de hoy":"Ripasso di oggi","Respuesta":"Risposta","Resultado":"Risultato","Secundaria":"Scuola media","Sesiones completadas":"Sessioni completate","Sesiones de enfoque":"Sessioni di concentrazione","Sin calificar":"Non valutato","TIEMPO DE ESTUDIO":"TEMPO DI STUDIO","Tareas completadas":"Attività completate","Tarjetas":"Schede","Tarjetas de memoria":"Flashcard","Tema para generar un examen con IA":"Argomento per creare un quiz con IA","Toca para voltear":"Tocca per girare","Tus exámenes":"I tuoi quiz","Título":"Titolo","Universidad":"Università","Volver":"Indietro","preguntas":"domande","repasos":"ripassi","tarjetas guardadas":"schede salvate","tarjetas pendientes":"schede da ripassare","✳ Generar examen con IA":"✳ Genera quiz con IA",
    "Actividades completadas por materia.":"Attività completate per materia.", "Agrega actividades para ver el progreso.":"Aggiungi attività per vedere i progressi.", "Agrega preguntas y selecciona la respuesta correcta.":"Aggiungi domande e seleziona la risposta corretta.", "Agregar pregunta":"Aggiungi domanda", "Apunte sin título":"Appunto senza titolo", "Apuntes guardados localmente en este navegador.":"Appunti salvati localmente in questo browser.", "Crea preguntas de opción múltiple y califica tus respuestas.":"Crea domande a scelta multipla e valuta le risposte.", "Crea un apunte para empezar.":"Crea un appunto per iniziare.", "Crea un examen con el formulario de al lado.":"Crea un quiz con il modulo accanto.", "Ej. Leyes de Newton":"Es. leggi di Newton", "Escribe ideas, fórmulas y resúmenes…":"Scrivi idee, formule e riassunti…", "Herramientas usadas":"Strumenti utilizzati", "Los apuntes permanecen en este navegador.":"Gli appunti restano in questo browser.", "Mide tus hábitos, no solo el tiempo frente a la pantalla.":"Misura le tue abitudini, non solo il tempo davanti allo schermo.", "No hay tarjetas pendientes. Crea una para empezar.":"Nessuna scheda da ripassare. Creane una per iniziare.", "Pregunta por delante, respuesta detrás.":"Domanda davanti, risposta dietro.", "Preguntas de examen":"Domande del quiz", "Repasa con repetición espaciada y recuerda activamente.":"Ripassa con la ripetizione dilazionata e il richiamo attivo.", "Tu actividad dentro de Estudiax.":"La tua attività in Estudiax.", "Una tarea a la vez, con descansos breves.":"Un’attività alla volta, con brevi pause.", "completadas":"completate", "guardados":"salvati", "intentos":"tentativi", "min de descanso":"min di pausa", "min de enfoque":"min di concentrazione"
  },
  de: {
    "Apuntes":"Notizen","Calificar":"Bewerten","Comenzar":"Starten","Constructor de examen":"Quiz erstellen","Correcta":"Richtig","Crear tarjeta":"Karte erstellen","Cuaderno digital":"Digitales Notizbuch","DESCANSO":"PAUSE","Difícil":"Schwierig","Eliminar":"Löschen","Empezar":"Beginnen","Estadísticas de aprendizaje":"Lernstatistik","Exámenes de práctica":"Übungstests","Física":"Physik","General":"Allgemein","Generando…":"Wird erstellt…","Guardar apunte":"Notiz speichern","Guardar examen":"Test speichern","Guardar tarjeta":"Karte speichern","Historia":"Geschichte","Inglés":"Englisch","La sabía":"Wusste ich","Matemáticas":"Mathematik","Materia":"Fach","Modo concentración":"Konzentrationsmodus","Nivel":"Stufe","Nuevo apunte":"Neue Notiz","Opción":"Option","Otra vez":"Noch einmal","Pausar":"Pause","Pregunta":"Frage","Preparatoria":"Oberstufe","Programación":"Programmierung","Progreso por materia":"Fortschritt nach Fach","Promedio de exámenes":"Testdurchschnitt","Práctica":"Übung","Química":"Chemie","Reiniciar":"Zurücksetzen","Repaso de hoy":"Heutige Wiederholung","Respuesta":"Antwort","Resultado":"Ergebnis","Secundaria":"Mittelschule","Sesiones completadas":"Abgeschlossene Sitzungen","Sesiones de enfoque":"Fokussitzungen","Sin calificar":"Nicht bewertet","TIEMPO DE ESTUDIO":"LERNZEIT","Tareas completadas":"Erledigte Aufgaben","Tarjetas":"Karteikarten","Tarjetas de memoria":"Lernkarten","Tema para generar un examen con IA":"Thema für einen KI-Test","Toca para voltear":"Zum Umdrehen tippen","Tus exámenes":"Deine Tests","Título":"Titel","Universidad":"Universität","Volver":"Zurück","preguntas":"Fragen","repasos":"Wiederholungen","tarjetas guardadas":"gespeicherte Karten","tarjetas pendientes":"fällige Karten","✳ Generar examen con IA":"✳ KI-Test erstellen",
    "Actividades completadas por materia.":"Abgeschlossene Aufgaben nach Fach.", "Agrega actividades para ver el progreso.":"Füge Aufgaben hinzu, um deinen Fortschritt zu sehen.", "Agrega preguntas y selecciona la respuesta correcta.":"Füge Fragen hinzu und wähle die richtige Antwort aus.", "Agregar pregunta":"Frage hinzufügen", "Apunte sin título":"Notiz ohne Titel", "Apuntes guardados localmente en este navegador.":"Notizen werden lokal in diesem Browser gespeichert.", "Crea preguntas de opción múltiple y califica tus respuestas.":"Erstelle Multiple-Choice-Fragen und bewerte deine Antworten.", "Crea un apunte para empezar.":"Erstelle eine Notiz, um zu beginnen.", "Crea un examen con el formulario de al lado.":"Erstelle mit dem Formular daneben einen Test.", "Ej. Leyes de Newton":"Z. B. Newtonsche Gesetze", "Escribe ideas, fórmulas y resúmenes…":"Schreibe Ideen, Formeln und Zusammenfassungen…", "Herramientas usadas":"Verwendete Werkzeuge", "Los apuntes permanecen en este navegador.":"Notizen bleiben in diesem Browser.", "Mide tus hábitos, no solo el tiempo frente a la pantalla.":"Miss deine Lerngewohnheiten, nicht nur die Bildschirmzeit.", "No hay tarjetas pendientes. Crea una para empezar.":"Keine Karteikarten zur Wiederholung. Erstelle eine, um zu beginnen.", "Pregunta por delante, respuesta detrás.":"Vorne die Frage, hinten die Antwort.", "Preguntas de examen":"Testfragen", "Repasa con repetición espaciada y recuerda activamente.":"Wiederhole mit verteiltem Lernen und aktivem Abrufen.", "Tu actividad dentro de Estudiax.":"Deine Aktivitäten in Estudiax.", "Una tarea a la vez, con descansos breves.":"Eine Aufgabe nach der anderen, mit kurzen Pausen.", "completadas":"abgeschlossen", "guardados":"gespeichert", "intentos":"Versuche", "min de descanso":"Min. Pause", "min de enfoque":"Min. Konzentration"
  },
  ru: {
    "Apuntes":"Заметки","Calificar":"Проверить","Comenzar":"Начать","Constructor de examen":"Конструктор теста","Correcta":"Верно","Crear tarjeta":"Создать карточку","Cuaderno digital":"Цифровой блокнот","DESCANSO":"ОТДЫХ","Difícil":"Сложно","Eliminar":"Удалить","Empezar":"Начать","Estadísticas de aprendizaje":"Статистика обучения","Exámenes de práctica":"Тренировочные тесты","Física":"Физика","General":"Общее","Generando…":"Создание…","Guardar apunte":"Сохранить заметку","Guardar examen":"Сохранить тест","Guardar tarjeta":"Сохранить карточку","Historia":"История","Inglés":"Английский","La sabía":"Я знал(а)","Matemáticas":"Математика","Materia":"Предмет","Modo concentración":"Режим концентрации","Nivel":"Уровень","Nuevo apunte":"Новая заметка","Opción":"Вариант","Otra vez":"Ещё раз","Pausar":"Пауза","Pregunta":"Вопрос","Preparatoria":"Старшая школа","Programación":"Программирование","Progreso por materia":"Прогресс по предметам","Promedio de exámenes":"Средний результат тестов","Práctica":"Практика","Química":"Химия","Reiniciar":"Сбросить","Repaso de hoy":"Повторение на сегодня","Respuesta":"Ответ","Resultado":"Результат","Secundaria":"Средняя школа","Sesiones completadas":"Завершённые сеансы","Sesiones de enfoque":"Сеансы концентрации","Sin calificar":"Не оценено","TIEMPO DE ESTUDIO":"ВРЕМЯ УЧЁБЫ","Tareas completadas":"Выполненные задания","Tarjetas":"Карточки","Tarjetas de memoria":"Карточки для запоминания","Tema para generar un examen con IA":"Тема для теста с ИИ","Toca para voltear":"Нажмите, чтобы перевернуть","Tus exámenes":"Ваши тесты","Título":"Название","Universidad":"Университет","Volver":"Назад","preguntas":"вопросов","repasos":"повторений","tarjetas guardadas":"сохранённых карточек","tarjetas pendientes":"карточек к повторению","✳ Generar examen con IA":"✳ Создать тест с ИИ",
    "Actividades completadas por materia.":"Выполненные задания по предметам.", "Agrega actividades para ver el progreso.":"Добавьте задания, чтобы увидеть прогресс.", "Agrega preguntas y selecciona la respuesta correcta.":"Добавьте вопросы и выберите правильный ответ.", "Agregar pregunta":"Добавить вопрос", "Apunte sin título":"Заметка без названия", "Apuntes guardados localmente en este navegador.":"Заметки сохранены локально в этом браузере.", "Crea preguntas de opción múltiple y califica tus respuestas.":"Создавайте вопросы с вариантами ответов и проверяйте себя.", "Crea un apunte para empezar.":"Создайте заметку, чтобы начать.", "Crea un examen con el formulario de al lado.":"Создайте тест с помощью формы рядом.", "Ej. Leyes de Newton":"Напр.: законы Ньютона", "Escribe ideas, fórmulas y resúmenes…":"Записывайте идеи, формулы и краткие выводы…", "Herramientas usadas":"Использованные инструменты", "Los apuntes permanecen en este navegador.":"Заметки остаются в этом браузере.", "Mide tus hábitos, no solo el tiempo frente a la pantalla.":"Отслеживайте учебные привычки, а не только время у экрана.", "No hay tarjetas pendientes. Crea una para empezar.":"Нет карточек для повторения. Создайте первую.", "Pregunta por delante, respuesta detrás.":"Вопрос спереди, ответ сзади.", "Preguntas de examen":"Вопросы теста", "Repasa con repetición espaciada y recuerda activamente.":"Повторяйте с интервалами и активно вспоминайте материал.", "Tu actividad dentro de Estudiax.":"Ваша активность в Estudiax.", "Una tarea a la vez, con descansos breves.":"Одно задание за раз, с короткими перерывами.", "completadas":"выполнено", "guardados":"сохранено", "intentos":"попыток", "min de descanso":"мин отдыха", "min de enfoque":"мин концентрации"
  }
};
Object.assign(studyTranslations, {
  hi: { "Modo concentración":"फ़ोकस मोड", "Una tarea a la vez, con descansos breves.":"एक समय में एक काम करें और छोटे विराम लें।", "Modo del temporizador":"टाइमर मोड", "Enfoque · 25 min":"फ़ोकस · 25 मिनट", "Pausa · 5 min":"छोटा विराम · 5 मिनट", "Descanso largo · 15 min":"लंबा विराम · 15 मिनट", "Progreso de la sesión":"सत्र की प्रगति", "Sesión terminada. ¡Buen trabajo!":"सत्र पूरा हुआ। बहुत बढ़िया!", "You're doing well · keep your pace":"आप अच्छा कर रहे हैं · अपनी गति बनाए रखें", "Vas muy bien · sigue a tu ritmo":"आप अच्छा कर रहे हैं · अपनी गति बनाए रखें", "Tu espacio, tu ritmo":"आपकी जगह, आपकी गति", "Ronda":"चक्र", "Sesiones completadas":"पूरे हुए सत्र", "Cada bloque cuenta":"हर सत्र मायने रखता है", "Pausar":"रोकें", "Comenzar a estudiar":"पढ़ाई शुरू करें", "Reiniciar":"रीसेट", "Reiniciar temporizador":"टाइमर रीसेट करें", "Siguiente fase":"अगला चरण", "Consejo: aleja las distracciones y elige una sola tarea para este bloque.":"ध्यान भटकाने वाली चीज़ें दूर रखें और इस सत्र के लिए एक काम चुनें।" },
  id: { "Modo concentración":"Mode fokus", "Una tarea a la vez, con descansos breves.":"Kerjakan satu hal setiap kali dengan jeda singkat.", "Modo del temporizador":"Mode timer", "Enfoque · 25 min":"Fokus · 25 mnt", "Pausa · 5 min":"Istirahat singkat · 5 mnt", "Descanso largo · 15 min":"Istirahat panjang · 15 mnt", "Progreso de la sesión":"Progres sesi", "Sesión terminada. ¡Buen trabajo!":"Sesi selesai. Kerja bagus!", "Vas muy bien · sigue a tu ritmo":"Kamu hebat · lanjutkan sesuai ritmemu", "Tu espacio, tu ritmo":"Ruangmu, ritmemu", "Ronda":"Putaran", "Sesiones completadas":"Sesi selesai", "Cada bloque cuenta":"Setiap sesi berarti", "Pausar":"Jeda", "Comenzar a estudiar":"Mulai fokus", "Reiniciar":"Atur ulang", "Reiniciar temporizador":"Atur ulang timer", "Siguiente fase":"Tahap berikutnya", "Consejo: aleja las distracciones y elige una sola tarea para este bloque.":"Jauhkan gangguan dan pilih satu tugas untuk sesi ini." },
  tr: { "Modo concentración":"Odak modu", "Una tarea a la vez, con descansos breves.":"Kısa molalarla her seferinde tek bir işe odaklan.", "Modo del temporizador":"Sayaç modu", "Enfoque · 25 min":"Odak · 25 dk", "Pausa · 5 min":"Kısa mola · 5 dk", "Descanso largo · 15 min":"Uzun mola · 15 dk", "Progreso de la sesión":"Oturum ilerlemesi", "Sesión terminada. ¡Buen trabajo!":"Oturum tamamlandı. Harika iş!", "Vas muy bien · sigue a tu ritmo":"Çok iyi gidiyorsun · kendi hızında devam et", "Tu espacio, tu ritmo":"Senin alanın, senin hızın", "Ronda":"Tur", "Sesiones completadas":"Tamamlanan oturumlar", "Cada bloque cuenta":"Her oturum önemli", "Pausar":"Duraklat", "Comenzar a estudiar":"Odaklanmaya başla", "Reiniciar":"Sıfırla", "Reiniciar temporizador":"Sayacı sıfırla", "Siguiente fase":"Sonraki aşama", "Consejo: aleja las distracciones y elige una sola tarea para este bloque.":"Dikkat dağıtıcıları uzaklaştır ve bu oturum için tek bir görev seç." },
  vi: { "Modo concentración":"Chế độ tập trung", "Una tarea a la vez, con descansos breves.":"Tập trung từng việc một và nghỉ ngắn giữa các phiên.", "Modo del temporizador":"Chế độ hẹn giờ", "Enfoque · 25 min":"Tập trung · 25 phút", "Pausa · 5 min":"Nghỉ ngắn · 5 phút", "Descanso largo · 15 min":"Nghỉ dài · 15 phút", "Progreso de la sesión":"Tiến độ phiên học", "Sesión terminada. ¡Buen trabajo!":"Đã hoàn thành phiên học. Làm tốt lắm!", "Vas muy bien · sigue a tu ritmo":"Bạn đang làm rất tốt · tiếp tục theo nhịp của mình", "Tu espacio, tu ritmo":"Không gian của bạn, nhịp độ của bạn", "Ronda":"Vòng", "Sesiones completadas":"Phiên đã hoàn thành", "Cada bloque cuenta":"Mỗi phiên đều có ý nghĩa", "Pausar":"Tạm dừng", "Comenzar a estudiar":"Bắt đầu tập trung", "Reiniciar":"Đặt lại", "Reiniciar temporizador":"Đặt lại bộ hẹn giờ", "Siguiente fase":"Giai đoạn tiếp theo", "Consejo: aleja las distracciones y elige una sola tarea para este bloque.":"Hãy loại bỏ yếu tố gây xao nhãng và chọn một việc cho phiên này." },
  nl: { "Modo concentración":"Focusmodus", "Una tarea a la vez, con descansos breves.":"Werk aan één taak tegelijk met korte pauzes.", "Modo del temporizador":"Timermodus", "Enfoque · 25 min":"Focus · 25 min", "Pausa · 5 min":"Korte pauze · 5 min", "Descanso largo · 15 min":"Lange pauze · 15 min", "Progreso de la sesión":"Voortgang van de sessie", "Sesión terminada. ¡Buen trabajo!":"Sessie voltooid. Goed gedaan!", "Vas muy bien · sigue a tu ritmo":"Je doet het goed · houd je eigen tempo aan", "Tu espacio, tu ritmo":"Jouw ruimte, jouw tempo", "Ronda":"Ronde", "Sesiones completadas":"Voltooide sessies", "Cada bloque cuenta":"Elk blok telt", "Pausar":"Pauzeren", "Comenzar a estudiar":"Start focus", "Reiniciar":"Resetten", "Reiniciar temporizador":"Timer resetten", "Siguiente fase":"Volgende fase", "Consejo: aleja las distracciones y elige una sola tarea para este bloque.":"Leg afleidingen weg en kies één taak voor dit blok." },
});
Object.assign(studyTranslations.hi, { "CONCENTRACIÓN":"एकाग्रता", "DESCANSO CORTO":"छोटा विराम", "DESCANSO LARGO":"लंबा विराम" });
Object.assign(studyTranslations.id, { "CONCENTRACIÓN":"FOKUS", "DESCANSO CORTO":"ISTIRAHAT SINGKAT", "DESCANSO LARGO":"ISTIRAHAT PANJANG" });
Object.assign(studyTranslations.tr, { "CONCENTRACIÓN":"ODAKLANMA", "DESCANSO CORTO":"KISA MOLA", "DESCANSO LARGO":"UZUN MOLA" });
Object.assign(studyTranslations.vi, { "CONCENTRACIÓN":"TẬP TRUNG", "DESCANSO CORTO":"NGHỈ NGẮN", "DESCANSO LARGO":"NGHỈ DÀI" });
Object.assign(studyTranslations.nl, { "CONCENTRACIÓN":"FOCUSSESSIE", "DESCANSO CORTO":"KORTE PAUZE", "DESCANSO LARGO":"LANGE PAUZE" });
const tr = (l: string, s: string, e: string) => l === "es" ? s : l === "en" ? e : studyTranslations[l]?.[s] || (l === "zh" ? zh[s] : undefined) || e;
function StudyQuote({ section, lang }: { section: string; lang: string }) {
  const quotes: Record<string, Record<string, { quote: string; author: string }>> = {
    flashcards: {
      ko: { quote: "기억하는 것도 배움의 한 방식입니다.", author: "Estudiax" },
      ja: { quote: "覚えることも学びの一つです。", author: "Estudiax" },
      es: { quote: "Recordar también es una forma de aprender.", author: "Estudiax" },
      en: { quote: "Remembering is also a way of learning.", author: "Estudiax" },
      fr: { quote: "Se souvenir est aussi une façon d’apprendre.", author: "Estudiax" },
      pt: { quote: "Lembrar também é uma forma de aprender.", author: "Estudiax" },
      zh: { quote: "记忆本身也是一种学习方式。", author: "Estudiax" },
    },
    exams: {
      ko: { quote: "정답을 맞히기 위해서만이 아니라 이해하기 위해 공부하세요.", author: "Estudiax" },
      ja: { quote: "正解するためだけでなく、理解するために学ぼう。", author: "Estudiax" },
      es: { quote: "No estudies solo para acertar; estudia para comprender.", author: "Estudiax" },
      en: { quote: "Don't study only to get it right; study to understand.", author: "Estudiax" },
      fr: {
        quote: "N’étudiez pas seulement pour réussir, mais pour comprendre.",
        author: "Estudiax",
      },
      pt: { quote: "Não estude apenas para acertar; estude para compreender.", author: "Estudiax" },
      zh: { quote: "学习不只是为了答对，更是为了理解。", author: "Estudiax" },
    },
    stats: {
      ko: { quote: "작은 진전도 모두 의미가 있습니다.", author: "Estudiax" },
      ja: { quote: "小さな一歩にも価値があります。", author: "Estudiax" },
      es: { quote: "Cada pequeño avance cuenta.", author: "Estudiax" },
      en: { quote: "Every small step forward counts.", author: "Estudiax" },
      fr: { quote: "Chaque petit progrès compte.", author: "Estudiax" },
      pt: { quote: "Cada pequeno progresso conta.", author: "Estudiax" },
      zh: { quote: "每一点小小的进步都很重要。", author: "Estudiax" },
    },
    focus: {
      ko: { quote: "집중력은 소중합니다. 한 번에 한 가지에 집중하세요.", author: "Estudiax" },
      ja: { quote: "集中力は大切です。一度に一つのことに向けましょう。", author: "Estudiax" },
      es: { quote: "Tu atención es valiosa: regálasela a una cosa a la vez.", author: "Estudiax" },
      en: {
        quote: "Your attention is valuable: give it to one thing at a time.",
        author: "Estudiax",
      },
      fr: {
        quote: "Votre attention est précieuse : consacrez-la à une chose à la fois.",
        author: "Estudiax",
      },
      pt: {
        quote: "Sua atenção é valiosa: dedique-a a uma coisa de cada vez.",
        author: "Estudiax",
      },
      zh: { quote: "你的注意力很宝贵：一次专注做好一件事。", author: "Estudiax" },
    },
    notes: {
      ko: { quote: "기록하면 생각이 더 명확해집니다.", author: "Estudiax" },
      ja: { quote: "書き留めることで、考えが明確になります。", author: "Estudiax" },
      es: {
        quote: "Una idea escrita puede convertirse en un gran descubrimiento.",
        author: "Estudiax",
      },
      en: { quote: "A written idea can become a great discovery.", author: "Estudiax" },
      fr: { quote: "Une idée écrite peut devenir une grande découverte.", author: "Estudiax" },
      pt: { quote: "Uma ideia anotada pode se tornar uma grande descoberta.", author: "Estudiax" },
      zh: { quote: "写下的一个想法，也许会成为重大发现。", author: "Estudiax" },
    },
  };
  const quoteFallbacks: Record<string, Record<string, { quote: string; author: string }>> = {
    it: { flashcards: { quote: "Ricordare è anche un modo per imparare.", author: "Estudiax" }, exams: { quote: "Non studiare solo per rispondere correttamente: studia per capire.", author: "Estudiax" }, stats: { quote: "Ogni piccolo progresso conta.", author: "Estudiax" }, focus: { quote: "La tua attenzione è preziosa: dedicati a una cosa alla volta.", author: "Estudiax" }, notes: { quote: "Un’idea scritta può diventare una grande scoperta.", author: "Estudiax" } },
    de: { flashcards: { quote: "Erinnern ist auch eine Form des Lernens.", author: "Estudiax" }, exams: { quote: "Lerne nicht nur für die richtige Antwort, sondern fürs Verständnis.", author: "Estudiax" }, stats: { quote: "Jeder kleine Fortschritt zählt.", author: "Estudiax" }, focus: { quote: "Deine Aufmerksamkeit ist wertvoll: widme dich einer Sache nach der anderen.", author: "Estudiax" }, notes: { quote: "Ein aufgeschriebener Gedanke kann zu einer großen Entdeckung werden.", author: "Estudiax" } },
    ru: { flashcards: { quote: "Запоминание — тоже способ учиться.", author: "Estudiax" }, exams: { quote: "Учитесь не только ради правильного ответа, но и ради понимания.", author: "Estudiax" }, stats: { quote: "Каждый маленький шаг вперёд важен.", author: "Estudiax" }, focus: { quote: "Ваше внимание ценно: сосредотачивайтесь на одном деле за раз.", author: "Estudiax" }, notes: { quote: "Записанная идея может стать великим открытием.", author: "Estudiax" } }
  };
  const q = quotes[section]?.[lang] || quoteFallbacks[lang]?.[section] || quotes[section].en || quotes[section].es;
  return (
    <section className="quote-card">
      <span aria-hidden="true">✦</span>
      <blockquote>“{q.quote}”</blockquote>
      <small>— {q.author}</small>
    </section>
  );
}
function Intro({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">ESTUDIAX · ESTUDIO</p>
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
      </div>
      {action}
    </div>
  );
}
function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state small">
      <p>{text}</p>
    </div>
  );
}
export function FlashcardsPage({ lang }: { lang: string }) {
  const [cards, C] = useState<Card[]>([]),
    [ready, R] = useState(false),
    [front, F] = useState(""),
    [back, B] = useState(""),
    [subject, S] = useState(""),
    [index, I] = useState(0),
    [flip, V] = useState(false);
  useEffect(() => {
    C(read("estudiax-flashcards-v1", []));
    R(true);
  }, []);
  useEffect(() => {
    if (ready) write("estudiax-flashcards-v1", cards);
  }, [cards, ready]);
  const due = cards.filter((c) => c.due <= new Date().toISOString().slice(0, 10)),
    card = due.length ? due[index % due.length] : undefined;
  function add(e: FormEvent) {
    e.preventDefault();
    C((p) => [
      ...p,
      {
        id: id(),
        subject: subject || "General",
        front: front.trim(),
        back: back.trim(),
        due: new Date().toISOString().slice(0, 10),
        reviews: 0,
      },
    ]);
    F("");
    B("");
  }
  function rate(days: number) {
    if (!card) return;
    C((p) =>
      p.map((c) =>
        c.id === card.id
          ? {
              ...c,
              due: new Date(Date.now() + days * 86400000).toISOString().slice(0, 10),
              reviews: c.reviews + 1,
            }
          : c,
      ),
    );
    V(false);
    I((i) => i + 1);
  }
  return (
    <>
      <Intro
        title={tr(lang, "Tarjetas de memoria", "Flashcards")}
        sub={tr(
          lang,
          "Repasa con repetición espaciada y recuerda activamente.",
          "Use spaced repetition and active recall.",
        )}
      />
      <StudyQuote section="flashcards" lang={lang} />
      <div className="dashboard-grid">
        <section className="panel">
          <Head
            title={tr(lang, "Repaso de hoy", "Today's review")}
            sub={`${due.length} ${tr(lang, "tarjetas pendientes", "cards due")}`}
          />
          {card ? (
            <>
              <button className={`flashcard ${flip ? "flipped" : ""}`} onClick={() => V((v) => !v)}>
                <small>
                  {card.subject} ·{" "}
                  {flip ? tr(lang, "Respuesta", "Answer") : tr(lang, "Pregunta", "Question")}
                </small>
                <strong>{flip ? card.back : card.front}</strong>
                <span>{tr(lang, "Toca para voltear", "Tap to flip")}</span>
              </button>
              {flip && (
                <div className="feature-actions">
                  <button className="secondary-btn" onClick={() => rate(0)}>
                    {tr(lang, "Otra vez", "Again")}
                  </button>
                  <button className="secondary-btn" onClick={() => rate(1)}>
                    {tr(lang, "Difícil", "Hard")}
                  </button>
                  <button className="primary-btn" onClick={() => rate(3)}>
                    {tr(lang, "La sabía", "Got it")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <Empty
              text={tr(
                lang,
                "No hay tarjetas pendientes. Crea una para empezar.",
                "No cards due. Create one to begin.",
              )}
            />
          )}
          <p className="feature-meta">
            {cards.length} {tr(lang, "tarjetas guardadas", "cards saved")} ·{" "}
            {cards.reduce((n, c) => n + c.reviews, 0)} {tr(lang, "repasos", "reviews")}
          </p>
          {cards.map((c) => (
            <div className="feature-list-row" key={c.id}>
              <div>
                <strong>{c.front}</strong>
                <small>
                  {c.subject} · {c.reviews} {tr(lang, "repasos", "reviews")}
                </small>
              </div>
              <button
                className="delete-task"
                onClick={() => C((p) => p.filter((x) => x.id !== c.id))}
              >
                ×
              </button>
            </div>
          ))}
        </section>
        <section className="panel">
          <Head
            title={tr(lang, "Crear tarjeta", "Create a card")}
            sub={tr(
              lang,
              "Pregunta por delante, respuesta detrás.",
              "Prompt on the front, answer on the back.",
            )}
          />
          <form className="feature-form" onSubmit={add}>
            <label>
              {tr(lang, "Materia", "Subject")}
              <input value={subject} onChange={(e) => S(e.target.value)} />
            </label>
            <label>
              {tr(lang, "Pregunta", "Question")}
              <textarea required rows={3} value={front} onChange={(e) => F(e.target.value)} />
            </label>
            <label>
              {tr(lang, "Respuesta", "Answer")}
              <textarea required rows={3} value={back} onChange={(e) => B(e.target.value)} />
            </label>
            <button className="primary-btn">＋ {tr(lang, "Guardar tarjeta", "Save card")}</button>
          </form>
        </section>
      </div>
    </>
  );
}
export function ExamsPage({ lang }: { lang: string }) {
  const [quizzes, Q] = useState<Quiz[]>([]),
    [ready, R] = useState(false),
    [title, T] = useState(""),
    [subject, S] = useState(""),
    [text, X] = useState(""),
    [options, O] = useState(["", "", "", ""]),
    [correct, C] = useState(0),
    [draft, D] = useState<Q[]>([]),
    [active, A] = useState<string | null>(null),
    [answers, AN] = useState<Record<string, number>>({}),
    [score, SC] = useState<number | null>(null),
    [aiTopic, AT] = useState(""),
    [aiBusy, AB] = useState(false),
    [aiError, AE] = useState("");
  useEffect(() => {
    Q(read("estudiax-quizzes-v1", []));
    R(true);
  }, []);
  useEffect(() => {
    if (ready) write("estudiax-quizzes-v1", quizzes);
  }, [quizzes, ready]);
  const quiz = quizzes.find((q) => q.id === active);
  function add(e: FormEvent) {
    e.preventDefault();
    if (options.some((o) => !o.trim())) return;
    D((p) => [
      ...p,
      { id: id(), text: text.trim(), options: options.map((o) => o.trim()), correct },
    ]);
    X("");
    O(["", "", "", ""]);
    C(0);
  }
  function saveQuiz() {
    if (!title.trim() || !draft.length) return;
    Q((p) => [
      ...p,
      { id: id(), title: title.trim(), subject: subject || "General", questions: draft },
    ]);
    T("");
    S("");
    D([]);
  }
  async function generateAI() {
    if (!aiTopic.trim()) return;
    AB(true);
    AE("");
    try {
      const response = await askTutor({
        data: {
          question: `Crea 3 preguntas de opción múltiple para secundaria sobre ${aiTopic}. Devuelve ÚNICAMENTE JSON válido, sin markdown ni texto extra, con este formato: [{"text":"pregunta","options":["A","B","C","D"],"correct":0}]. correct es el índice 0-3 de la respuesta correcta.`,
          context: "Generación de examen de práctica.",
        },
      });
      const start = response.answer.indexOf("["),
        end = response.answer.lastIndexOf("]");
      if (start < 0 || end < start)
        throw new Error("La IA no devolvió un formato de examen válido. Intenta otra vez.");
      const parsed = JSON.parse(response.answer.slice(start, end + 1)) as Array<{
        text: string;
        options: string[];
        correct: number;
      }>;
      if (
        !parsed.length ||
        parsed.some(
          (q) =>
            !q.text ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            !Number.isInteger(q.correct) ||
            q.correct < 0 ||
            q.correct > 3,
        )
      )
        throw new Error("El formato de las preguntas no era válido. Intenta otra vez.");
      Q((p) => [
        ...p,
        {
          id: id(),
          title: `${tr(lang, "Práctica", "Practice")}: ${aiTopic.trim()}`,
          subject: subject || aiTopic.trim(),
          questions: parsed.map((q) => ({
            id: id(),
            text: q.text,
            options: q.options,
            correct: q.correct,
          })),
        },
      ]);
      AT("");
    } catch (e) {
      AE(e instanceof Error ? e.message : "No se pudo generar el examen.");
    } finally {
      AB(false);
    }
  }
  function grade() {
    if (!quiz) return;
    const s = quiz.questions.filter((q) => answers[q.id] === q.correct).length;
    SC(s);
    const percent = Math.round((s / quiz.questions.length) * 100);
    Q((p) => p.map((q) => (q.id === quiz.id ? { ...q, best: Math.max(q.best || 0, percent) } : q)));
    write("estudiax-quiz-results-v1", [...read<number[]>("estudiax-quiz-results-v1", []), percent]);
  }
  return (
    <>
      <Intro
        title={tr(lang, "Exámenes de práctica", "Practice exams")}
        sub={tr(
          lang,
          "Crea preguntas de opción múltiple y califica tus respuestas.",
          "Create multiple-choice questions and grade your answers.",
        )}
      />
      <StudyQuote section="exams" lang={lang} />
      {quiz ? (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>{quiz.title}</h2>
              <p>{quiz.subject}</p>
            </div>
            <button
              className="secondary-btn"
              onClick={() => {
                A(null);
                SC(null);
                AN({});
              }}
            >
              {tr(lang, "Volver", "Back")}
            </button>
          </div>
          {quiz.questions.map((q, i) => (
            <div className="quiz-question" key={q.id}>
              <strong>
                {i + 1}. {q.text}
              </strong>
              {q.options.map((o, j) => (
                <label className="quiz-option" key={j}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === j}
                    disabled={score !== null}
                    onChange={() => AN((p) => ({ ...p, [q.id]: j }))}
                  />
                  {o}
                  {score !== null && j === q.correct ? " ✓" : ""}
                </label>
              ))}
            </div>
          ))}
          {score === null ? (
            <button className="primary-btn" onClick={grade}>
              {tr(lang, "Calificar", "Grade exam")}
            </button>
          ) : (
            <div className="notice">
              {tr(lang, "Resultado", "Result")}: {score}/{quiz.questions.length} ·{" "}
              {Math.round((score / quiz.questions.length) * 100)}%
            </div>
          )}
        </section>
      ) : (
        <div className="dashboard-grid">
          <section className="panel">
            <Head
              title={tr(lang, "Tus exámenes", "Your quizzes")}
              sub={`${quizzes.length} ${tr(lang, "guardados", "saved")}`}
            />
            {quizzes.length ? (
              quizzes.map((q) => (
                <div className="feature-list-row" key={q.id}>
                  <div>
                    <strong>{q.title}</strong>
                    <small>
                      {q.subject} · {q.questions.length} {tr(lang, "preguntas", "questions")} ·{" "}
                      {q.best === undefined
                        ? tr(lang, "Sin calificar", "Not graded")
                        : `Mejor ${q.best}%`}
                    </small>
                  </div>
                  <button
                    className="primary-btn"
                    onClick={() => {
                      A(q.id);
                      AN({});
                      SC(null);
                    }}
                  >
                    {tr(lang, "Empezar", "Start")}
                  </button>
                  <button
                    className="delete-task"
                    onClick={() => Q((p) => p.filter((x) => x.id !== q.id))}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <Empty
                text={tr(
                  lang,
                  "Crea un examen con el formulario de al lado.",
                  "Create a quiz with the form beside this one.",
                )}
              />
            )}
          </section>
          <section className="panel">
            <Head
              title={tr(lang, "Constructor de examen", "Quiz builder")}
              sub={tr(
                lang,
                "Agrega preguntas y selecciona la respuesta correcta.",
                "Add questions and select the correct answer.",
              )}
            />
            <div className="feature-form">
              <div className="ai-quiz-box">
                <label>
                  {tr(lang, "Tema para generar un examen con IA", "Topic for AI-generated quiz")}
                  <input
                    value={aiTopic}
                    onChange={(e) => AT(e.target.value)}
                    placeholder={tr(lang, "Ej. Leyes de Newton", "E.g. Newton's laws")}
                  />
                </label>
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={aiBusy || !aiTopic.trim()}
                  onClick={generateAI}
                >
                  {aiBusy
                    ? tr(lang, "Generando…", "Generating…")
                    : tr(lang, "✳ Generar examen con IA", "✳ Generate with AI")}
                </button>
                {aiError && <p className="task-instructions">{aiError}</p>}
              </div>
              <label>
                {tr(lang, "Título", "Title")}
                <input value={title} onChange={(e) => T(e.target.value)} />
              </label>
              <label>
                {tr(lang, "Materia", "Subject")}
                <input value={subject} onChange={(e) => S(e.target.value)} />
              </label>
              <form onSubmit={add}>
                <label>
                  {tr(lang, "Pregunta", "Question")}
                  <textarea required rows={2} value={text} onChange={(e) => X(e.target.value)} />
                </label>
                {options.map((o, i) => (
                  <label className="option-input" key={i}>
                    <span>
                      <input
                        type="radio"
                        name="correct"
                        checked={correct === i}
                        onChange={() => C(i)}
                      />
                      {tr(lang, "Correcta", "Correct")}
                    </span>
                    <input
                      required
                      value={o}
                      onChange={(e) => O((p) => p.map((v, j) => (i === j ? e.target.value : v)))}
                      placeholder={`${tr(lang, "Opción", "Option")} ${i + 1}`}
                    />
                  </label>
                ))}
                <button className="secondary-btn">
                  ＋ {tr(lang, "Agregar pregunta", "Add question")}
                </button>
              </form>
              {draft.map((q, i) => (
                <div className="feature-list-row" key={q.id}>
                  <div>
                    <strong>
                      {i + 1}. {q.text}
                    </strong>
                    <small>{q.options[q.correct]}</small>
                  </div>
                  <button
                    className="delete-task"
                    onClick={() => D((p) => p.filter((x) => x.id !== q.id))}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="primary-btn"
                disabled={!title.trim() || !draft.length}
                onClick={saveQuiz}
              >
                {tr(lang, "Guardar examen", "Save quiz")}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
export function FocusPage({ lang }: { lang: string }) {
  type TimerMode = "focus" | "short" | "long";
  const durations: Record<TimerMode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const [mode, setMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(durations.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [completed, setCompleted] = useState(false);
  const completionHandled = useRef(false);
  useEffect(() => { setSessions(read("estudiax-focus-sessions-v1", 0)); }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setRemaining(current => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!running || remaining !== 0 || completionHandled.current) return;
    completionHandled.current = true;
    setRunning(false);
    setCompleted(true);
    if (mode === "focus") setSessions(n => { const next = n + 1; write("estudiax-focus-sessions-v1", next); return next; });
  }, [remaining, running, mode]);
  function chooseMode(next: TimerMode) {
    completionHandled.current = false;
    setRunning(false); setMode(next); setRemaining(durations[next]); setCompleted(false);
  }
  function reset() { completionHandled.current = false; setRunning(false); setRemaining(durations[mode]); setCompleted(false); }
  function nextMode() { chooseMode(mode === "focus" ? "short" : "focus"); }
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  const circumference = 2 * Math.PI * 104;
  const progress = remaining / durations[mode];
  const modeLabels: Record<TimerMode, { es: string; en: string }> = {
    focus: { es: "CONCENTRACIÓN", en: "FOCUS SESSION" },
    short: { es: "DESCANSO CORTO", en: "SHORT BREAK" },
    long: { es: "DESCANSO LARGO", en: "LONG BREAK" },
  };
  return (
    <>
      <Intro title={tr(lang, "Modo concentración", "Focus mode")} sub={tr(lang, "Una tarea a la vez, con descansos breves.", "One task at a time, with short breaks.")} />
      <StudyQuote section="focus" lang={lang} />
      <section className={`panel focus-panel focus-panel-${mode}`}>
        <div className="focus-mode-tabs" role="group" aria-label={tr(lang, "Modo del temporizador", "Timer mode")}>
          {(["focus", "short", "long"] as TimerMode[]).map(item => <button key={item} type="button" className={`focus-mode-tab${mode === item ? " active" : ""}`} aria-pressed={mode === item} onClick={() => chooseMode(item)}>{item === "focus" ? tr(lang, "Enfoque · 25 min", "Focus · 25 min") : item === "short" ? tr(lang, "Pausa · 5 min", "Short break · 5 min") : tr(lang, "Descanso largo · 15 min", "Long break · 15 min")}</button>)}
        </div>
        <div className="focus-timer-stage">
          <svg className="focus-progress-ring" viewBox="0 0 240 240" role="img" aria-label={tr(lang, "Progreso de la sesión", "Session progress")}>
            <circle className="focus-ring-track" cx="120" cy="120" r="104" />
            <circle className="focus-ring-value" cx="120" cy="120" r="104" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
          </svg>
          <div className="focus-timer-center">
            <span className="focus-mode-label">{tr(lang, modeLabels[mode].es, modeLabels[mode].en)}</span>
            <div className="focus-clock" role="timer" aria-live="off">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</div>
            <span className="focus-timer-hint">{completed ? tr(lang, "Sesión terminada. ¡Buen trabajo!", "Session complete. Well done!") : running ? tr(lang, "Vas muy bien · sigue a tu ritmo", "You're doing well · keep your pace") : tr(lang, "Tu espacio, tu ritmo", "Your space, your pace")}</span>
          </div>
        </div>
        <div className="focus-session-progress" aria-label={`${sessions % 4} / 4`}>
          {[0, 1, 2, 3].map(i => <span key={i} className={i < sessions % 4 ? "done" : i === sessions % 4 && mode === "focus" ? "current" : ""} />)}
          <small>{tr(lang, "Ronda", "Round")} {sessions % 4 === 0 && sessions > 0 ? 4 : sessions % 4 || 1} / 4</small>
        </div>
        <div className="focus-session-count"><span className="focus-session-icon">✦</span><div><strong>{sessions}</strong><small>{tr(lang, "Sesiones completadas", "Sessions completed")}</small></div><span className="focus-session-note">{tr(lang, "Cada bloque cuenta", "Every block counts")}</span></div>
        <div className="feature-actions centered focus-controls">
          <button className="primary-btn focus-start-btn" onClick={() => { if (remaining === 0) { completionHandled.current = false; setRemaining(durations[mode]); } setCompleted(false); setRunning(v => !v); }}><span aria-hidden="true">{running ? "Ⅱ" : "▶"}</span>{running ? tr(lang, "Pausar", "Pause") : tr(lang, "Comenzar a estudiar", "Start focusing")}</button>
          <button className="secondary-btn focus-reset-btn" aria-label={tr(lang, "Reiniciar temporizador", "Reset timer")} onClick={reset}>↺ {tr(lang, "Reiniciar", "Reset")}</button>
          <button className="secondary-btn focus-skip-btn" onClick={nextMode}>{tr(lang, "Siguiente fase", "Next phase")} ↗</button>
        </div>
        <p className="focus-footer-tip">{tr(lang, "Consejo: aleja las distracciones y elige una sola tarea para este bloque.", "Tip: put distractions away and choose one task for this block.")}</p>
      </section>
    </>
  );
}
let mindfulnessAudioContext: AudioContext | null = null;
function mindfulnessTone(kind: "dong" | "ding") {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    mindfulnessAudioContext ??= new AudioContextClass();
    const ctx = mindfulnessAudioContext;
    // Schedule the sound synchronously from the user's click, then resume if the browser suspended audio.
    const now = ctx.currentTime + 0.04;
    const frequencies = kind === "dong" ? [392, 523.25] : [880];
    frequencies.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const duration = kind === "dong" ? 1.2 : 0.34;
      const offset = index * 0.16;
      osc.type = kind === "dong" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(frequency, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(kind === "dong" ? 0.42 : 0.24, now + offset + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + duration + 0.03);
    });
    if (ctx.state !== "running") void ctx.resume().catch(() => {});
  } catch { /* Audio is optional; the breathing timer still works without it. */ }
}

export function MindfulnessPage({ lang }: { lang: string }) {
  const [pattern, setPattern] = useState<3 | 4 | 6>(4);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const previousPhase = useRef(0);
  const sessionLength = 180;
  const phaseIndex = Math.floor(elapsed / pattern) % 4;
  const copy: Record<string, Record<string, string>> = {
    es: { title:"Mindfulness", sub:"Haz una pausa. Vuelve a tu respiración, sin prisa.", start:"Empezar sesión", pause:"Pausar", reset:"Reiniciar", inhale:"Inhala", hold:"Aguanta", exhale:"Exhala", done:"Sesión completada. Tómate un momento antes de continuar.", remaining:"Tiempo restante", rhythm:"Ritmo de respiración", cycle:"Cada fase dura", seconds:"segundos", tip:"Respira suavemente. Si te resulta incómodo aguantar el aire, vuelve a respirar con normalidad." },
    en: { title:"Mindfulness", sub:"Take a pause. Return to your breath, without rushing.", start:"Start session", pause:"Pause", reset:"Reset", inhale:"Inhale", hold:"Hold", exhale:"Exhale", done:"Session complete. Take a moment before continuing.", remaining:"Time remaining", rhythm:"Breathing rhythm", cycle:"Each phase lasts", seconds:"seconds", tip:"Breathe gently. If holding your breath feels uncomfortable, return to normal breathing." },
    fr: { title:"Pleine conscience", sub:"Fais une pause. Reviens à ta respiration, sans te presser.", start:"Commencer", pause:"Pause", reset:"Recommencer", inhale:"Inspire", hold:"Retiens", exhale:"Expire", done:"Séance terminée. Prends un instant avant de continuer.", remaining:"Temps restant", rhythm:"Rythme respiratoire", cycle:"Chaque phase dure", seconds:"secondes", tip:"Respire doucement. Si retenir ton souffle est inconfortable, respire normalement." },
    pt: { title:"Atenção plena", sub:"Faça uma pausa. Volte à respiração, sem pressa.", start:"Iniciar sessão", pause:"Pausar", reset:"Reiniciar", inhale:"Inspire", hold:"Segure", exhale:"Expire", done:"Sessão concluída. Faça uma pausa antes de continuar.", remaining:"Tempo restante", rhythm:"Ritmo respiratório", cycle:"Cada fase dura", seconds:"segundos", tip:"Respire suavemente. Se prender a respiração for desconfortável, volte a respirar normalmente." },
    zh: { title:"正念呼吸", sub:"停一停，慢慢把注意力带回呼吸。", start:"开始练习", pause:"暂停", reset:"重新开始", inhale:"吸气", hold:"屏息", exhale:"呼气", done:"练习完成。稍作停留，再继续。", remaining:"剩余时间", rhythm:"呼吸节奏", cycle:"每个阶段", seconds:"秒", tip:"轻柔呼吸。如果屏息让你不舒服，请恢复自然呼吸。" },
  };
  const t = (key: string) => copy[lang]?.[key] || copy.en[key] || key;
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed(value => Math.min(sessionLength, value + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!running) return;
    if (elapsed >= sessionLength) {
      setRunning(false); setFinished(true); mindfulnessTone("dong"); return;
    }
    const currentPhase = Math.floor(elapsed / pattern) % 4;
    if (currentPhase !== previousPhase.current) { previousPhase.current = currentPhase; mindfulnessTone("ding"); }
  }, [elapsed, running, pattern]);
  const phaseName = phaseIndex === 0 ? t("inhale") : phaseIndex === 2 ? t("exhale") : t("hold");
  const left = Math.max(0, sessionLength - elapsed);
  const formatTime = (seconds: number) => String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
  const start = () => {
    if (finished || elapsed >= sessionLength) { setElapsed(0); previousPhase.current = 0; setFinished(false); }
    if (!running) mindfulnessTone("dong");
    setRunning(value => !value);
  };
  const reset = () => { setRunning(false); setElapsed(0); setFinished(false); previousPhase.current = 0; };
  return (
    <section className="panel mindfulness-panel">
      <div className="mindfulness-heading"><span className="mindfulness-icon" aria-hidden="true">☯</span><div><h2>{t("title")}</h2><p>{t("sub")}</p></div></div>
      <div className={"mindfulness-orb phase-" + phaseIndex + (running ? " breathing" : "")}><div className="mindfulness-orb-inner"><span>{finished ? "✓" : phaseName}</span><strong>{finished ? "" : running ? pattern : "∿"}</strong></div></div>
      <div className="mindfulness-time"><small>{t("remaining")}</small><strong>{formatTime(left)}</strong></div>
      <div className="mindfulness-pattern-label">{t("rhythm")}</div>
      <div className="mindfulness-patterns" role="group" aria-label={t("rhythm")}>
        {([3,4,6] as const).map(seconds => <button type="button" key={seconds} className={"mindfulness-pattern" + (pattern === seconds ? " active" : "")} aria-pressed={pattern === seconds} disabled={running} onClick={() => { setPattern(seconds); previousPhase.current = Math.floor(elapsed / seconds) % 4; }}>{seconds}-{seconds}-{seconds}-{seconds}</button>)}
      </div>
      <p className="mindfulness-tip">{t("cycle")} {pattern} {t("seconds")}. {t("tip")}</p>
      {finished && <p className="mindfulness-complete" role="status">{t("done")}</p>}
      <div className="feature-actions centered mindfulness-controls"><button className="primary-btn" type="button" onClick={start}>{running ? t("pause") : t("start")}</button><button className="secondary-btn" type="button" onClick={reset}>{t("reset")}</button></div>
      <small className="mindfulness-sound-note">♪ {lang === "es" ? "Dong al comenzar y terminar · ding en cada cambio de fase" : "Dong at start and finish · ding at every breathing phase change"}</small>
    </section>
  );
}

export function NotesPage({ lang }: { lang: string }) {
  const [notes, N] = useState<string[]>([]),
    [ready, R] = useState(false),
    [idx, I] = useState(0),
    [title, T] = useState(""),
    [body, B] = useState("");
  useEffect(() => {
    N(read("estudiax-notes-v1", []));
    R(true);
  }, []);
  useEffect(() => {
    if (ready) write("estudiax-notes-v1", notes);
  }, [notes, ready]);
  useEffect(() => {
    const n = notes[idx] || "",
      p = n.indexOf("\n");
    T(p < 0 ? n : n.slice(0, p));
    B(p < 0 ? "" : n.slice(p + 1));
  }, [idx, notes.length]);
  function saveNote() {
    const value = `${title.trim() || tr(lang, "Apunte sin título", "Untitled note")}\n${body}`;
    N((p) => {
      const a = [...p];
      if (a[idx] !== undefined) a[idx] = value;
      else a.push(value);
      return a;
    });
  }
  function newNote() {
    N((p) => [...p, `${tr(lang, "Nuevo apunte", "New note")}\n`]);
    I(notes.length);
    T(tr(lang, "Nuevo apunte", "New note"));
    B("");
  }
  return (
    <>
      <Intro
        title={tr(lang, "Cuaderno digital", "Digital notebook")}
        sub={tr(
          lang,
          "Apuntes guardados localmente en este navegador.",
          "Notes saved locally in this browser.",
        )}
        action={
          <button className="primary-btn" onClick={newNote}>
            ＋ {tr(lang, "Nuevo apunte", "New note")}
          </button>
        }
      />
      <StudyQuote section="notes" lang={lang} />
      <div className="notes-layout">
        <section className="panel notes-list">
          {notes.length ? (
            notes.map((n, i) => (
              <button
                key={i}
                className={`note-item ${idx === i ? "selected-note" : ""}`}
                onClick={() => I(i)}
              >
                <strong>{n.split("\n")[0]}</strong>
                <small>{n.split("\n").slice(1).join(" ").slice(0, 70)}</small>
              </button>
            ))
          ) : (
            <Empty text={tr(lang, "Crea un apunte para empezar.", "Create a note to begin.")} />
          )}
        </section>
        <section className="panel notes-editor">
          <label>
            {tr(lang, "Título", "Title")}
            <input value={title} onChange={(e) => T(e.target.value)} />
          </label>
          <label>
            {tr(lang, "Apuntes", "Notes")}
            <textarea
              rows={18}
              value={body}
              onChange={(e) => B(e.target.value)}
              placeholder={tr(
                lang,
                "Escribe ideas, fórmulas y resúmenes…",
                "Write ideas, formulas and summaries…",
              )}
            />
          </label>
          <div className="feature-actions">
            <button className="primary-btn" onClick={saveNote}>
              {tr(lang, "Guardar apunte", "Save note")}
            </button>
            {notes[idx] !== undefined && (
              <button
                className="danger-btn"
                onClick={() => {
                  N((p) => p.filter((_, i) => i !== idx));
                  I(Math.max(0, idx - 1));
                }}
              >
                {tr(lang, "Eliminar", "Delete")}
              </button>
            )}
          </div>
          <small className="feature-meta">
            {tr(lang, "Los apuntes permanecen en este navegador.", "Notes stay in this browser.")}
          </small>
        </section>
      </div>
    </>
  );
}
export function StatsPage({ lang, tasks }: { lang: string; tasks: Task[] }) {
  const [sessions, SS] = useState(0),
    [results, RR] = useState<number[]>([]),
    [cards, CC] = useState<Card[]>([]),
    [notes, NN] = useState(0),
    [quizCount, QC] = useState(0);
  useEffect(() => {
    SS(read("estudiax-focus-sessions-v1", 0));
    RR(read("estudiax-quiz-results-v1", []));
    CC(read("estudiax-flashcards-v1", []));
    NN(read<string[]>("estudiax-notes-v1", []).length);
    QC(read<Quiz[]>("estudiax-quizzes-v1", []).reduce((n, q) => n + q.questions.length, 0));
  }, []);
  const done = tasks.filter((t) => t.done).length,
    avg = results.length ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : 0,
    subjects = [...new Set(tasks.map((t) => t.subject).filter(Boolean))];
  return (
    <>
      <Intro
        title={tr(lang, "Estadísticas de aprendizaje", "Learning statistics")}
        sub={tr(
          lang,
          "Mide tus hábitos, no solo el tiempo frente a la pantalla.",
          "Track your learning, not just screen time.",
        )}
      />
      <StudyQuote section="stats" lang={lang} />
      <div className="stats-grid">
        <Stat
          title={tr(lang, "Tareas completadas", "Tasks completed")}
          value={`${done}/${tasks.length}`}
          detail={`${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%`}
        />
        <Stat
          title={tr(lang, "Sesiones de enfoque", "Focus sessions")}
          value={String(sessions)}
          detail={tr(lang, "completadas", "completed")}
        />
        <Stat
          title={tr(lang, "Promedio de exámenes", "Quiz average")}
          value={`${avg}%`}
          detail={`${results.length} ${tr(lang, "intentos", "attempts")}`}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <Head
            title={tr(lang, "Progreso por materia", "Progress by subject")}
            sub={tr(lang, "Actividades completadas por materia.", "Completed tasks by subject.")}
          />
          {subjects.length ? (
            subjects.map((s) => {
              const a = tasks.filter((t) => t.subject === s),
                d = a.filter((t) => t.done).length;
              return (
                <div className="stat-subject" key={s}>
                  <div>
                    <strong>{s}</strong>
                    <small>
                      {d}/{a.length}
                    </small>
                  </div>
                  <div className="mini-progress">
                    <span style={{ width: `${(d / a.length) * 100}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <Empty
              text={tr(
                lang,
                "Agrega actividades para ver el progreso.",
                "Add tasks to see progress.",
              )}
            />
          )}
        </section>
        <section className="panel">
          <Head
            title={tr(lang, "Herramientas usadas", "Tools used")}
            sub={tr(lang, "Tu actividad dentro de Estudiax.", "Your activity in Estudiax.")}
          />
          {[
            [tr(lang, "Tarjetas", "Flashcards"), cards.length],
            [tr(lang, "Apuntes", "Notes"), notes],
            [tr(lang, "Preguntas de examen", "Quiz questions"), quizCount],
          ].map(([s, n]) => (
            <div className="feature-list-row" key={String(s)}>
              <strong>{s}</strong>
              <b>{n}</b>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
function Stat({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        {title}
        <span>◈</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function TutorContext({
  lang,
  subject,
  setSubject,
  level,
  setLevel,
}: {
  lang: string;
  subject: string;
  setSubject: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
}) {
  return (
    <div className="form-two tutor-context">
      <label>
        {tr(lang, "Materia", "Subject")}
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option>{tr(lang, "General", "General")}</option>
          <option>{tr(lang, "Matemáticas", "Mathematics")}</option>
          <option>{tr(lang, "Física", "Physics")}</option>
          <option>{tr(lang, "Química", "Chemistry")}</option>
          <option>{tr(lang, "Historia", "History")}</option>
          <option>{tr(lang, "Inglés", "English")}</option>
          <option>{tr(lang, "Programación", "Programming")}</option>
        </select>
      </label>
      <label>
        {tr(lang, "Nivel", "Level")}
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>{tr(lang, "Secundaria", "Middle school")}</option>
          <option>{tr(lang, "Preparatoria", "High school")}</option>
          <option>{tr(lang, "Universidad", "University")}</option>
        </select>
      </label>
    </div>
  );
}
