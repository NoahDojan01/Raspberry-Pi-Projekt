import type { Question } from '@/types'

export const QUESTIONS: Question[] = [
  // ─── Kategorie 1: Glaubensbekenntnis ────────────────────────────────────────
  {
    id: 1,
    categoryNumber: 1,
    category: 'Glaubensbekenntnis',
    question: 'Welche Rolle hat die Bibel in unserem Glauben?',
    answer: 'Die Bibel ist das von Gott inspirierte, einzig unfehlbare, souveräne Wort Gottes.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 2,
    categoryNumber: 1,
    category: 'Glaubensbekenntnis',
    question: 'Wo wurden die Nachfolger Jesu zum ersten Mal Christen genannt?',
    answer: 'Antiochia',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 3,
    categoryNumber: 1,
    category: 'Glaubensbekenntnis',
    question: 'Wie heißt der Vers, der die Grundlagen unseres Glaubens bildet?',
    answer:
      'So seid ihr nun nicht mehr Fremdlinge und Gäste ohne Bürgerrecht, sondern Mitbürger der Heiligen und Gottes Hausgenossen, auferbaut auf den Grund der Apostel, während Jesus Christus selbst der Eckstein ist. (Epheser 2,19-20)',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
    hint: 'Epheser 2,19-20',
  },
  {
    id: 4,
    categoryNumber: 1,
    category: 'Glaubensbekenntnis',
    question: 'Nenne mindestens fünf Dinge, an die wir glauben in Bezug auf Jesus Christus!',
    answer:
      'seine Gottheit; seine jungfräuliche Geburt; sein sündloses Leben; die Wunder, die durch ihn vollbracht wurden; seine Kreuzigung auf Golgatha für die Sünder; seine Auferstehung; seine Himmelfahrt; seine persönliche, zukünftige Wiederkunft; die Entrückung der Gemeinde bei seiner Wiederkunft',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 2: Lehre über den Gott-Vater ──────────────────────────────────
  {
    id: 5,
    categoryNumber: 2,
    category: 'Lehre über den Gott-Vater',
    question: 'Zähle mindestens fünf Merkmale Gottes auf!',
    answer: 'Geist; Licht; Liebe; Ewig; Unsichtbar; gerecht; allmächtig; intolerant zur Sünde',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 6,
    categoryNumber: 2,
    category: 'Lehre über den Gott-Vater',
    question: 'Welche Schritte sind notwendig, um Gott zu erkennen?',
    answer:
      'Wir sollen ihn von ganzem Herzen suchen; Wir sollen in Demut zu ihm kommen; Wir sollen an Jesus Christus glauben',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 7,
    categoryNumber: 2,
    category: 'Lehre über den Gott-Vater',
    question: 'Weshalb können wir Gott nicht mit unseren Sinnen wahrnehmen?',
    answer:
      'Weil der Mensch durch den Sündenfall von Gott getrennt wurde; Weil das sündige Auge den Anblick Gottes nicht ertragen kann; Weil Gottes Geist unsichtbar ist',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 8,
    categoryNumber: 2,
    category: 'Lehre über den Gott-Vater',
    question: 'Woran erkennen wir, dass es einen Gott gibt?',
    answer:
      'In der Schöpfung zeigen ihre Größe, Ordnung und Schönheit uns Gottes Allmacht, Weisheit und Größe; An seiner Offenbarung unter dem Volk Israel; An seiner Offenbarung in Jesus Christus; Am Zeugnis unseres Gewissens',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 3: Lehre über Gott-Jesus ──────────────────────────────────────
  {
    id: 9,
    categoryNumber: 3,
    category: 'Lehre über Gott-Jesus',
    question: 'Nenne sieben Wunder, die Jesus auf der Erde ausführte!',
    answer:
      'Krankenheilung; Essensvermehrung; Gedanken lesen; Wiederbelebung/Totenauferweckung; Wasser zu Wein; Gehen auf dem Wasser; Dämonen austreiben',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 10,
    categoryNumber: 3,
    category: 'Lehre über Gott-Jesus',
    question: 'Nenne fünf Eigenschaften Jesu, die zeigen, dass er ein Mensch war!',
    answer:
      'er hatte Hunger; er wurde müde; er wurde traurig, weinte; er freute sich; er wurde zornig',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 11,
    categoryNumber: 3,
    category: 'Lehre über Gott-Jesus',
    question: 'Nenne fünf Namen oder Titel Jesu und erkläre, was sie bedeuten!',
    answer:
      'Jesus: Jahwe ist Rettung/Hilfe; Christus: der Gesalbte; Messias: der Gesalbte; Immanuel: Gott mit uns; Rabbi: Gelehrter',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 12,
    categoryNumber: 3,
    category: 'Lehre über Gott-Jesus',
    question: 'Beschreibe drei Motive, warum Jesus als Mensch auf die Erde kam!',
    answer:
      'Um uns Menschen mit Gott zu versöhnen, durch seinen Tod auf Golgatha; Um mitzufühlen mit unseren menschlichen Versuchungen; Damit jeder, der an die Menschwerdung Jesu und seinen Tod glaubt, gerettet wird',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 13,
    categoryNumber: 3,
    category: 'Lehre über Gott-Jesus',
    question: 'Nenne Menschen, denen Jesus nach seiner Auferstehung begegnet ist!',
    answer: 'Jünger/Apostel; Maria Magdalena; Paulus; 500 ungenannte Personen',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 4: Lehre über den Gott-Heiligen Geist ──────────────────────────
  {
    id: 14,
    categoryNumber: 4,
    category: 'Lehre über den Gott-Heiligen Geist',
    question: 'Wer ist der Heilige Geist?',
    answer:
      '3. Person der göttlichen Dreieinigkeit; Er ist Gott und somit besitzt er alle Eigenschaften Gottes',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 15,
    categoryNumber: 4,
    category: 'Lehre über den Gott-Heiligen Geist',
    question: 'Nenne zwei Zeichen für die Taufe mit dem Heiligen Geist!',
    answer:
      'Anfängliches Zeichen: Beten in Sprachen; Endgültiges Zeichen: geisterfüllter, christlicher Lebenswandel',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 16,
    categoryNumber: 4,
    category: 'Lehre über den Gott-Heiligen Geist',
    question: 'Nenne mindestens fünf Gaben des Heiligen Geistes!',
    answer:
      'Wort der Weisheit; Wort der Erkenntnis; Glauben; Heilungen; Wunder; Weissagungen; Geisterunterscheidung; Sprachenrede; Auslegung der Sprachenrede',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 17,
    categoryNumber: 4,
    category: 'Lehre über den Gott-Heiligen Geist',
    question: 'Zähle fünf Funktionen des Heiligen Geistes auf!',
    answer:
      'Er bestimmt; Er ist ein Zeuge von Jesus Christus; Er lehrt und leitet das Volk Gottes; Er ist ein guter Führer; Er ist die große Gabe/Verheißung; Er vertritt uns vor dem Vater; Er spricht zur Gemeinde und zu jedem persönlich',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 18,
    categoryNumber: 4,
    category: 'Lehre über den Gott-Heiligen Geist',
    question: 'Nenne vier Aspekte, welche die Taufe mit dem Heiligen Geist darstellen!',
    answer: 'Kindschaft; Salbung; Zeugnis; Siegel',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 5: Die Heilige Schrift ──────────────────────────────────────────
  {
    id: 19,
    categoryNumber: 5,
    category: 'Die Heilige Schrift',
    question: 'Nenne die Urtextsprachen des Alten und Neuen Testaments!',
    answer: 'Altes Testament: Aramäisch, Hebräisch; Neues Testament: Griechisch',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 20,
    categoryNumber: 5,
    category: 'Die Heilige Schrift',
    question: 'Von wem und wann wird die gesamte Bibel ins Deutsche übersetzt?',
    answer: '1543, von Dr. Martin Luther',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 21,
    categoryNumber: 5,
    category: 'Die Heilige Schrift',
    question: 'Welchen Nutzen hat die Heilige Schrift?',
    answer: 'Belehrung; Überführung; Zurechtweisung; Erziehung in der Gerechtigkeit',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 22,
    categoryNumber: 5,
    category: 'Die Heilige Schrift',
    question: 'Die Heilige Schrift wird beschrieben als…',
    answer: 'rein; wahr; vollkommen; kostbar; wirksam/mächtig',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 6: Lehre von der Wiedergeburt ────────────────────────────────────
  {
    id: 23,
    categoryNumber: 6,
    category: 'Lehre von der Wiedergeburt',
    question: 'Erkläre, ob der wiedergeborene Mensch sündigen kann!',
    answer:
      'Wir kämpfen täglich gegen die Sünde. Wenn ein wiedergeborener Mensch sündigt, so verbleibt er nicht in der Sünde, sondern bittet bei Jesus Christus um Vergebung.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 24,
    categoryNumber: 6,
    category: 'Lehre von der Wiedergeburt',
    question:
      'Nenne mindestens sechs Zeichen, die einen wiedergeborenen Menschen von einem geistlich toten Menschen unterscheiden!',
    answer:
      'lebt nicht nur für sich selbst; der Nächste ist ihm wichtig; er lebt für Gott; er versucht aus Liebe zu Gott nicht zu sündigen; wenn er doch sündigt, will er nicht in der Sünde bleiben und bittet um Vergebung; Liebe zu Geschwistern im Herrn; Geist gibt unserem Geist Zeugnis; an den Werken erkennbar',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 25,
    categoryNumber: 6,
    category: 'Lehre von der Wiedergeburt',
    question: 'Erkläre den Unterschied zwischen Buße und Wiedergeburt!',
    answer:
      'Wiedergeburt: geistliche, neue Geburt, Bekehrung, einmaliges Ereignis; Buße/Heiligung: Heiligung bleibt ein Prozess bis zum Kommen Christi, Buße läuft parallel zur Wiedergeburt',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 7: Das geistliche Wachstum ───────────────────────────────────────
  {
    id: 26,
    categoryNumber: 7,
    category: 'Das geistliche Wachstum',
    question: 'Warum sollte ein Kind Gottes geistlich wachsen?',
    answer: 'Um Jesus Christus immer ähnlicher zu werden; Um geistlich nicht zu sterben',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 27,
    categoryNumber: 7,
    category: 'Das geistliche Wachstum',
    question: 'Nenne mindestens drei Ergebnisse des geistlichen Wachstums!',
    answer:
      'Segen in allen Lebensbereichen; geordnetes und ausgeglichenes Leben; echte Lebensfreude; Friede, Ruhe und Sicherheit; fruchtbringendes Leben; geistliches Unterscheidungsvermögen; wachsender Schatz im Himmel',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 28,
    categoryNumber: 7,
    category: 'Das geistliche Wachstum',
    question: 'Erläutere das geistliche Wachstum anhand der Natur!',
    answer:
      'Ein Same wird gepflanzt (Evangelisation, der Mensch hört von Gott); Der Same keimt und geht auf (Wiedergeburt, und fängt an zu wachsen); Der Keimling wächst durch Nährstoffe von außen (der neue Mensch benötigt Gottes Schutz, Liebe, Ermahnung); Die Pflanze benötigt Licht, Regen und Wärme (ein Christ muss sich mit dem Wort Gottes, der Gemeinde und dem Gebet beschäftigen); Die Pflanze bringt Frucht (der Christ hat sich einen Dienst gefunden und bezeugt anderen Menschen durch sein Verhalten und Reden von Gott)',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: true,
    requiresOrder: false,
    hint: 'WICHTIG: Die Erklärungen in Klammern müssen ebenfalls genannt werden!',
  },

  // ─── Kategorie 8: Das Gebet ───────────────────────────────────────────────────────
  {
    id: 29,
    categoryNumber: 8,
    category: 'Das Gebet',
    question: 'Nenne mindestens zwei Arten des Gebets!',
    answer: 'Fürbitte; Danksagung; Bußgebet',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 30,
    categoryNumber: 8,
    category: 'Das Gebet',
    question: 'Nenne zwei Grundvoraussetzungen, die für ein erhörtes Gebet notwendig sind!',
    answer: 'Glaube; Wille Gottes',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 31,
    categoryNumber: 8,
    category: 'Das Gebet',
    question: 'Nenne fünf Merkmale, wie man richtig betet!',
    answer:
      'beständig (Lukas 18,1-14); aufrichtig (1. Thes. 5,17); im Kämmerlein (Matthäus 5,5-6); das Vaterunser (Lukas 11,1-4); Gebet im Geist',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 9: Biblisches Fasten ─────────────────────────────────────────────
  {
    id: 32,
    categoryNumber: 9,
    category: 'Biblisches Fasten',
    question: 'Auf welche Bereiche des Lebens bezieht sich das Fasten?',
    answer: 'essen; trinken; spielen; schlafen; Unterhaltung',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 33,
    categoryNumber: 9,
    category: 'Biblisches Fasten',
    question: 'Warum sollten wir regelmäßig fasten?',
    answer:
      'Um die Beziehung zu Jesus aufrecht zu erhalten, geistlich zu wachsen und Stärkung im Glauben zu erleben',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 34,
    categoryNumber: 9,
    category: 'Biblisches Fasten',
    question: 'Was bewirkt das Fasten in uns?',
    answer: 'Wir erhalten neue Kraft und eine Salbung Gottes',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 35,
    categoryNumber: 9,
    category: 'Biblisches Fasten',
    question: 'Definiere den Unterschied zwischen falschem und richtigem Fasten!',
    answer:
      'Richtig: von ganzem Herzen, Gott suchen in der Not, sehnen nach Erfüllung und Freude im Geist; Falsch: von den Menschen gesehen werden, um Ansehen der Person zu bekommen oder es zu tun, weil alle es tun',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 10: Die Heiligung ──────────────────────────────────────────────────
  {
    id: 36,
    categoryNumber: 10,
    category: 'Die Heiligung',
    question: 'Welches Opfer musst du für deine Sünden bringen? Begründe deine Aussage!',
    answer:
      'Kein Opfer! Jesus selbst ist für meine Schuld gestorben, sodass vor Gottes Gerechtigkeit keine weiteren Opfer mehr nötig sind.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 37,
    categoryNumber: 10,
    category: 'Die Heiligung',
    question: 'Was kann dir helfen, wenn du eine Sünde nicht lassen kannst?',
    answer:
      'Vor 2 oder 3 Zeugen bekennen (am besten Diener der Gemeinde); Diener in der Gemeinde beten für einen um Kraft, gegen die Sünde zu kämpfen',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 38,
    categoryNumber: 10,
    category: 'Die Heiligung',
    question: 'Erkläre die Begriffe Heilig und Heiligung!',
    answer:
      'Heilig: absondern für Gott (weihen für Gott, für Gott bestimmt, Gott heiligt mit der Wiedergeburt); Heiligung: Sünde bekennen, von Sünde distanzieren',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 11: Wahre Anbetung ────────────────────────────────────────────────
  {
    id: 39,
    categoryNumber: 11,
    category: 'Wahre Anbetung',
    question: 'Was ist Anbetung?',
    answer:
      'Gott steht im Mittelpunkt; Anbetung ist ein besonderes Lob, Dank, Preisgebet; Anbetung ist eine Herzensangelegenheit und nichts Nebensächliches',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 40,
    categoryNumber: 11,
    category: 'Wahre Anbetung',
    question: 'Welche drei Bestandteile benötigen wir zur wahren Anbetung?',
    answer: 'Heiligung; Wahrheit; Geist',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 41,
    categoryNumber: 11,
    category: 'Wahre Anbetung',
    question:
      'Nenne mindestens ein Beispiel aus der Bibel, bei welchem wahre Anbetung stattfindet!',
    answer:
      'Petrus auf dem Berg der Verklärung; Mose vor dem brennenden Busch; Nebukadnezar als er erkannte, dass alles durch Gott Bestand hat; König David in verschiedenen Psalmen',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 42,
    categoryNumber: 11,
    category: 'Wahre Anbetung',
    question: 'Nenne mindestens drei Dinge, die dich daran hindern, Gott wahrhaftig anzubeten!',
    answer:
      'Unglaube; Sünde; schlechtes Gewissen; nicht ernst gemeinte Gebete; Unachtsamkeit; Sorgen und Probleme; Heuchelei; Unwahrheit; Stolz; fleischliche Emotionen',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 12: Biblisches Verhalten ─────────────────────────────────────────
  {
    id: 43,
    categoryNumber: 12,
    category: 'Biblisches Verhalten',
    question: 'Warum ist die Furcht Gottes so wichtig?',
    answer: 'Die Furcht Gottes ist der Anfang der Erkenntnis.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 44,
    categoryNumber: 12,
    category: 'Biblisches Verhalten',
    question: 'Welche Verheißung steht hinter dem Gebot des Gehorsams gegenüber den Eltern?',
    answer: 'Damit es dir gut geht und du lange lebest auf Erden.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 45,
    categoryNumber: 12,
    category: 'Biblisches Verhalten',
    question: 'Was bedeutet es, sich Gott zu unterordnen?',
    answer: 'Gottes Autorität anzuerkennen; Er steht über uns und führt uns',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 46,
    categoryNumber: 12,
    category: 'Biblisches Verhalten',
    question: 'Nenne fünf Grundvoraussetzungen für biblisches Verhalten!',
    answer:
      'Kind Gottes sein (Sündenvergebung); Bereitschaft lernen zu wollen (Unterordnung); Kenntnis des Wortes Gottes (Spiegel); Verständnis über Gottes Heiligkeit (Gottes Vorstellung); Furcht Gottes (Unterscheidung von gut und böse)',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 13: Dienst in der Gemeinde ───────────────────────────────────────
  {
    id: 47,
    categoryNumber: 13,
    category: 'Dienst in der Gemeinde',
    question: 'Nenne zwei Bedingungen, um einen Dienst für Gott tun zu können!',
    answer: 'Glaube an Gott; zur Ehre Gottes',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 48,
    categoryNumber: 13,
    category: 'Dienst in der Gemeinde',
    question: 'Nenne Dienste in der Gemeinde!',
    answer:
      'Diakon; Gruppenleiter; Chorleiter; Chormitglieder; Prediger; Übersetzer; Putzgruppen; Hausmeister; Krankenbesuchgruppe; Kopfhörerausgabe; Kochgruppe; Ordner',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 49,
    categoryNumber: 13,
    category: 'Dienst in der Gemeinde',
    question:
      'Nenne zwei Punkte, warum es wichtig ist, dass der Glaube durch die Werke sichtbar wird!',
    answer:
      'Glaube ohne Werke ist tot; Wer weiß Gutes zu tun und tut es nicht, dem ist es Sünde',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 50,
    categoryNumber: 13,
    category: 'Dienst in der Gemeinde',
    question: 'Übersetze/Erkläre folgende Begriffe aus der Bibel! (Diakon, Bischof, Pastor, Prophet, Apostel, Evangelist)',
    answer:
      'Diakon: Diener, Helfer; Bischof: Aufseher, Hüter; Pastor: Hirte; Prophet: Sendbote, Voraussager; Apostel: Gesandter; Evangelist: Verkünder des Evangeliums',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 14: Lehre über die Engel ─────────────────────────────────────────
  {
    id: 51,
    categoryNumber: 14,
    category: 'Lehre über die Engel',
    question: 'Was bedeutet Engel?',
    answer: 'Gesandter oder Botschafter',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 52,
    categoryNumber: 14,
    category: 'Lehre über die Engel',
    question: 'Nenne zwei besondere Arten von Engeln!',
    answer: 'Seraphim; Cherubim',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 53,
    categoryNumber: 14,
    category: 'Lehre über die Engel',
    question: 'Was sind Engel? Nenne mindestens drei Merkmale!',
    answer:
      'Engel sind dienstbare Geister; Engel handeln im Auftrag Gottes; Engel sind von Gott erschaffene Wesen; Engel sind Persönlichkeiten; Engel beschützen, die Gott fürchten',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 54,
    categoryNumber: 14,
    category: 'Lehre über die Engel',
    question: 'Nenne vier Eigenschaften der Engel!',
    answer:
      'Engel sind Gott untertan; Engel besitzen menschliche Gefühle; Engel sind nicht allwissend; Engel sind nicht allgegenwärtig',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 15: Satan der Widersacher ────────────────────────────────────────
  {
    id: 55,
    categoryNumber: 15,
    category: 'Satan der Widersacher',
    question: 'Warum ist der Teufel gefallen?',
    answer:
      'Er wurde aufgrund seiner Weisheit, seinem Glanz und seiner Schönheit überheblich (Stolz) und wollte Gott gleich werden.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 56,
    categoryNumber: 15,
    category: 'Satan der Widersacher',
    question: 'Wie wirkt Satan heute? Nenne vier wesentliche Aspekte!',
    answer:
      'Er versucht die Menschen zu verführen und ins Verderben zu führen; Er ist der Vater der Lüge; Gottes Heilsplan zu durchkreuzen; Den Menschen von Gott zu trennen',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 57,
    categoryNumber: 15,
    category: 'Satan der Widersacher',
    question: 'Wie kann man dem Teufel widerstehen? Nenne drei Möglichkeiten!',
    answer:
      'Indem man die geistliche Waffenrüstung anzieht; Wenn eine enge Verbindung zu Jesus besteht; Wenn der Christ in seinem Leben dem Teufel keine Angriffsfläche gibt',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 58,
    categoryNumber: 15,
    category: 'Satan der Widersacher',
    question: 'Welches Ziel verfolgt der Teufel, wenn er dich verführt?',
    answer: 'Dich zu zerstören; Dich von Gott zu trennen; Dass du in der Hölle landest',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 16: Gefahren für die Jungschar ───────────────────────────────────
  {
    id: 59,
    categoryNumber: 16,
    category: 'Gefahren für die Jungschar dieser Zeit',
    question: 'Warum sollen wir soziale Netzwerke meiden?',
    answer:
      'Keine wahre Gemeinschaft; Birgt Gefahr der Überheblichkeit und des Stolzes; Absolute Zeitverschwendung; Influencer werden zu Vorbildern',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 60,
    categoryNumber: 16,
    category: 'Gefahren für die Jungschar dieser Zeit',
    question: 'Warum sollte ich „weltliche" Gruppenchats meiden?',
    answer:
      'Bilder und Videos werden geteilt, die ich sonst nicht abgerufen hätte; Sinnlose Dialoge werden geführt; Gewaltverherrlichung und Pornographie sind vorbestimmt',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 61,
    categoryNumber: 16,
    category: 'Gefahren für die Jungschar dieser Zeit',
    question: 'Nach welchen Kriterien sollte ein Christ seine Musik aussuchen?',
    answer: 'Wer ist der Interpret?; Textinhalt; Musikstil, Rhythmik',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 62,
    categoryNumber: 16,
    category: 'Gefahren für die Jungschar dieser Zeit',
    question: 'Welche fünf Gefahren birgt das Internet für uns Christen?',
    answer:
      'Zeitverschwendung; Klatsch und Tratsch; moralischer und geistlicher Verfall; pornographische Inhalte; Suchtpotenzial',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 17: Gottes Heilsplan für Dich ────────────────────────────────────
  {
    id: 63,
    categoryNumber: 17,
    category: 'Gottes Heilsplan für Dich',
    question: 'Erkläre, wer Gottes Heil benötigt!',
    answer: 'Alle Menschen, da wir seit dem Sündenfall alle Sünder sind',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 64,
    categoryNumber: 17,
    category: 'Gottes Heilsplan für Dich',
    question: 'Welche Möglichkeit gibt es, um gerettet zu werden?',
    answer: 'Nicht aus Werken, allein Glaube an Jesus rettet',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 65,
    categoryNumber: 17,
    category: 'Gottes Heilsplan für Dich',
    question: 'Beschreibe Gottes Heilsplan für die Menschen!',
    answer:
      'Gott liebt die Welt; Er lässt seinen Sohn für uns sterben; Jeder der an ihn glaubt hat das ewige Leben; Gott will, dass alle Menschen gerettet werden',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 66,
    categoryNumber: 17,
    category: 'Gottes Heilsplan für Dich',
    question: 'Erkläre, seit wann Gottes Heilsplan für die Menschen feststand!',
    answer:
      'Noch vor Entstehung der Welt, da Gott wusste, dass alle Menschen sündigen und verloren gehen werden.',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 67,
    categoryNumber: 17,
    category: 'Gottes Heilsplan für Dich',
    question: 'Nenne drei Punkte, die Gottes Heilsplan für dich bereithält!',
    answer: 'Rechtfertigung; Versöhnung; Erlösung',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },

  // ─── Kategorie 18: Spezifisches Pflichtprogramm ──────────────────────────────────
  {
    id: 68,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Wie viele Bücher hat die Bibel? Unterteile auch nach Testamenten!',
    answer: 'Gesamt: 66 Bücher; Altes Testament: 39 Bücher; Neues Testament: 27 Bücher',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 69,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question:
      'Nenne das Gebot, das eine Verheißung beinhaltet, und nenne diese Verheißung!',
    answer:
      'Ehre Vater und Mutter, auf das es dir wohl gehe und du lange lebest auf Erden.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 70,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Was ist Glaube und wo steht es in der Bibel?',
    answer:
      'Es ist aber der Glaube, eine feste Zuversicht dessen, was man hofft und ein Nichtzweifeln an dem, was man nicht sieht. (Hebräer 11,1)',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 71,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Warum benötigen wir die Waffenrüstung? (Eph. 6, 10-14)',
    answer: 'Um den Versuchungen des Teufels zu widerstehen.',
    difficulty: 'leicht',
    points: 1,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 72,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zähle die Namen der 12 Jünger auf! (Mt. 10, 2-4)',
    answer:
      'Simon (genannt Petrus); Andreas; Jakobus; Johannes; Philippus; Bartholomäus; Thomas; Matthäus; Jakobus; Lebbäus (mit Zunamen Thadäus); Simon; Judas Iskariot',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 73,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zitiere den Psalm 1!',
    answer:
      'Wohl dem Mann, der den Rat der Gottlosen nicht befolgt, der den Weg der Sünder nicht betritt und nicht sitzt, wo die Spötter sitzen, sondern Freude hat am Gesetz des HERRN und über sein Gesetz nachdenkt bei Tag und bei Nacht! Der ist wie ein Baum, gepflanzt an Wasserbächen, der seine Frucht bringt zu seiner Zeit, und seine Blätter verwelken nicht; und alles, was er tut, wird ihm gelingen. Aber so sind die Gottlosen nicht, sondern wie Spreu, die der Wind verweht. Darum bestehen die Gottlosen nicht im Gericht und die Sünder nicht in der Gemeinde der Gerechten. Denn der HERR kennt den Weg der Gerechten; aber den Weg der Gottlosen führt ins Verderben.',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 74,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zitiere den Psalm 23!',
    answer:
      'Ein Psalm Davids. Der HERR ist mein Hirte; mir wird nichts mangeln. Er weidet mich auf einer grünen Aue und führt mich zum frischen Wasser. Er erquickt meine Seele; Er führt mich auf rechter Straße wegen seines Namens. Und wenn ich auch wanderte im finsteren Tal, fürchte ich kein Unglück; denn du bist bei mir, dein Stecken und Stab trösten mich. Du bereitest mir einen Tisch im Angesicht meiner Feinde. Du salbst mein Haupt mit Öl und schenkst mir übervoll ein. Gutes und Barmherzigkeit werden mir mein Leben lang folgen, und ich werde immerdar im Haus des HERRN bleiben.',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 75,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zähle die Frucht des Geistes auf! (Gal. 5, 22-23)',
    answer:
      'Liebe; Freude; Friede; Geduld; Freundlichkeit; Güte; Treue; Sanftmut; Selbstbeherrschung',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 76,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question:
      'Zähle die Merkmale der Liebe auf! (Röm. 13, 10; Kol. 3, 14; 1.Joh. 4, 7)',
    answer:
      'Die Liebe tut dem Nächsten nichts Böses; Die Liebe ist das Band der Vollkommenheit; Die Liebe ist von Gott; Die Liebe ist die Erfüllung des Gesetzes',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 77,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zähle alle Teile der Geistlichen Waffenrüstung auf! (Eph. 6, 14-18)',
    answer:
      'Lenden umgürtet mit der Wahrheit; Panzer der Gerechtigkeit; Schuhe der Bereitschaft des Evangeliums des Friedens; Schild des Glaubens; Helm des Heils; Schwert des Geistes, welches das Wort Gottes ist',
    difficulty: 'mittel',
    points: 2,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 78,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zähle alle Bücher des Alten Testaments in der richtigen Reihenfolge auf!',
    answer:
      '1.Mose; 2.Mose; 3.Mose; 4.Mose; 5.Mose; Josua; Richter; Rut; 1.Samuel; 2.Samuel; 1.Könige; 2.Könige; 1.Chronik; 2.Chronik; Esra; Nehemia; Ester; Hiob; Psalm; Sprüche; Prediger; Hohelied; Jesaja; Jeremia; Klagelieder; Hesekiel; Daniel; Hosea; Joel; Amos; Obadja; Jona; Micha; Nahum; Habakuk; Zefanja; Haggai; Sacharja; Maleachi',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 79,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zähle alle Bücher des Neuen Testaments in der richtigen Reihenfolge auf!',
    answer:
      'Matthäus; Markus; Lukas; Johannes; Apostelgeschichte; Römer; 1.Korinther; 2.Korinther; Galater; Epheser; Philipper; Kolosser; 1.Thessalonicher; 2.Thessalonicher; 1.Timotheus; 2.Timotheus; Titus; Philemon; 1.Petrus; 2.Petrus; 1.Johannes; 2.Johannes; 3.Johannes; Hebräer; Jakobus; Judas; Offenbarung',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: false,
  },
  {
    id: 80,
    categoryNumber: 18,
    category: 'Spezifisches Pflichtprogramm',
    question: 'Zähle die Zehn Gebote auf! (2. Mose 20, 2-17)',
    answer:
      '1. Du sollst keine anderen Götter haben neben mir; 2. Du sollst dir kein Bildnis oder irgendein Abbild machen; 3. Du sollst den Namen des HERRN nicht missbrauchen; 4. Denke an den Sabbat, dass du ihn heiligst; 5. Du sollst deinen Vater und deine Mutter ehren; 6. Du sollst nicht morden; 7. Du sollst nicht ehebrechen; 8. Du sollst nicht stehlen; 9. Du sollst nicht falsche Zeugenaussagen machen gegen deinen Nächsten; 10. Du sollst nicht begehren deines Nächsten Haus, noch alles was deinem Nächsten gehört',
    difficulty: 'schwer',
    points: 3,
    requiresBrackets: false,
    requiresOrder: true,
    hint: 'WICHTIG: Die Gebote müssen in der EXAKTEN richtigen Reihenfolge (1-10) angegeben werden!',
  },
]

export const CATEGORIES = [
  { number: 1, name: 'Glaubensbekenntnis' },
  { number: 2, name: 'Lehre über den Gott-Vater' },
  { number: 3, name: 'Lehre über Gott-Jesus' },
  { number: 4, name: 'Lehre über den Gott-Heiligen Geist' },
  { number: 5, name: 'Die Heilige Schrift' },
  { number: 6, name: 'Lehre von der Wiedergeburt' },
  { number: 7, name: 'Das geistliche Wachstum' },
  { number: 8, name: 'Das Gebet' },
  { number: 9, name: 'Biblisches Fasten' },
  { number: 10, name: 'Die Heiligung' },
  { number: 11, name: 'Wahre Anbetung' },
  { number: 12, name: 'Biblisches Verhalten' },
  { number: 13, name: 'Dienst in der Gemeinde' },
  { number: 14, name: 'Lehre über die Engel' },
  { number: 15, name: 'Satan der Widersacher' },
  { number: 16, name: 'Gefahren für die Jungschar dieser Zeit' },
  { number: 17, name: 'Gottes Heilsplan für Dich' },
  { number: 18, name: 'Spezifisches Pflichtprogramm' },
]

export const DIFFICULTY_POINTS: Record<string, number> = {
  leicht: 1,
  mittel: 2,
  schwer: 3,
}

export function getQuestionsByDifficulty(difficulty: string) {
  return QUESTIONS.filter((q) => q.difficulty === difficulty)
}

export function getQuestionsByCategory(categoryNumber: number) {
  return QUESTIONS.filter((q) => q.categoryNumber === categoryNumber)
}

export function selectSimulationQuestions(): Question[] {
  const easy = shuffleArray(getQuestionsByDifficulty('leicht'))
  const medium = shuffleArray(getQuestionsByDifficulty('mittel'))
  const hard = shuffleArray(getQuestionsByDifficulty('schwer'))
  return shuffleArray([...easy.slice(0, 7), ...medium.slice(0, 7), ...hard.slice(0, 6)])
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
