import { ExerciseDefinition } from "../types";

export const ADDITIONAL_EXERCISES: ExerciseDefinition[] = [
  {
    "id": "smith-machine-bench-press",
    "name": "Smith Machine Bench Press",
    "italianName": "Panca Piana al Multipower",
    "muscle": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 40,
      "silver": 60,
      "gold": 85,
      "platinum": 110,
      "diamond": 135
    },
    "tips": [
      "Il bilanciere guidato permette di concentrarti sulla spinta senza gestire l'equilibrio laterale."
    ],
    "commonMistakes": [
      "Posizionare la panca troppo lontana o vicina al fermo, alterando l'arco di movimento naturale."
    ]
  },
  {
    "id": "converging-machine-chest-press",
    "name": "Converging Machine Chest Press",
    "italianName": "Chest Press Convergente alla Macchina",
    "muscle": "chest",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 38,
      "silver": 60,
      "gold": 85,
      "platinum": 110,
      "diamond": 135
    },
    "tips": [
      "Le leve convergenti permettono una contrazione di picco extra a fine spinta, uniscile lentamente."
    ],
    "commonMistakes": [
      "Bloccare completamente i gomiti a fine ripetizione scaricando la tensione sull'articolazione."
    ]
  },
  {
    "id": "decline-dumbbell-press",
    "name": "Decline Dumbbell Press",
    "italianName": "Panca Declinata con Manubri",
    "muscle": "chest",
    "secondaryMuscles": [
      "triceps"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 120,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 16,
      "silver": 24,
      "gold": 34,
      "platinum": 44,
      "diamond": 54
    },
    "tips": [
      "Blocca i piedi ai supporti e mantieni il core stabile per non scivolare durante la spinta."
    ],
    "commonMistakes": [
      "Far scendere troppo i manubri sollecitando eccessivamente la cuffia dei rotatori."
    ]
  },
  {
    "id": "single-arm-cable-crossover",
    "name": "Single Arm Cable Crossover",
    "italianName": "Cavi Incrociati Monolaterale",
    "muscle": "chest",
    "secondaryMuscles": [
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Ruota leggermente il busto in fase di contrazione per aumentare l'accorciamento del pettorale."
    ],
    "commonMistakes": [
      "Utilizzare tutto il braccio anziché isolare il movimento all'articolazione della spalla."
    ]
  },
  {
    "id": "incline-cable-fly",
    "name": "Incline Cable Fly",
    "italianName": "Croci ai Cavi su Panca Inclinata",
    "muscle": "chest",
    "secondaryMuscles": [
      "shoulders"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 75,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 9,
      "silver": 16,
      "gold": 23,
      "platinum": 32,
      "diamond": 42
    },
    "tips": [
      "Regola le carrucole in basso per colpire il fascio clavicolare del pettorale."
    ],
    "commonMistakes": [
      "Alzare troppo le braccia trasformando la croce in una spinta verticale."
    ]
  },
  {
    "id": "svend-press",
    "name": "Svend Press",
    "italianName": "Svend Press con Dischi",
    "muscle": "chest",
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Premi i due dischi uno contro l'altro con i palmi durante tutta l'estensione per massimizzare la tensione."
    ],
    "commonMistakes": [
      "Allontanare troppo i gomiti perdendo la pressione costante tra i dischi."
    ]
  },
  {
    "id": "landmine-chest-press",
    "name": "Landmine Chest Press",
    "italianName": "Landmine Press per Petto",
    "muscle": "chest",
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 20,
      "silver": 35,
      "gold": 50,
      "platinum": 70,
      "diamond": 90
    },
    "tips": [
      "L'angolo del landmine riduce lo stress sulla spalla rispetto alla panca piana classica."
    ],
    "commonMistakes": [
      "Spingere solo con un lato del corpo ruotando il busto durante la spinta."
    ]
  },
  {
    "id": "cable-pullover",
    "name": "Cable Pullover",
    "italianName": "Pullover ai Cavi in Piedi",
    "muscle": "back",
    "secondaryMuscles": [
      "chest",
      "triceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 35,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "Mantieni le braccia quasi tese e porta la barra dall'alto verso le cosce inarcando leggermente il petto."
    ],
    "commonMistakes": [
      "Piegare troppo i gomiti trasformando il pullover in un pushdown per tricipiti."
    ]
  },
  {
    "id": "machine-high-row",
    "name": "Machine High Row",
    "italianName": "High Row alla Macchina",
    "muscle": "back",
    "secondaryMuscles": [
      "biceps",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 35,
      "silver": 55,
      "gold": 80,
      "platinum": 105,
      "diamond": 130
    },
    "tips": [
      "L'impugnatura alta enfatizza il fascio superiore del dorsale e i romboidi."
    ],
    "commonMistakes": [
      "Usare uno slancio del busto all'indietro invece di tirare solo con le braccia."
    ]
  },
  {
    "id": "inverted-row",
    "name": "Inverted Row",
    "italianName": "Rematore Inverso a Corpo Libero",
    "muscle": "back",
    "secondaryMuscles": [
      "biceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 20,
      "gold": 35,
      "platinum": 50,
      "diamond": 65
    },
    "tips": [
      "Più il corpo è orizzontale, più l'esercizio diventa impegnativo: regola l'altezza della barra."
    ],
    "commonMistakes": [
      "Far cedere il bacino verso il basso perdendo la linea retta del corpo."
    ]
  },
  {
    "id": "meadows-row",
    "name": "Meadows Row",
    "italianName": "Rematore Meadows con Bilanciere",
    "muscle": "back",
    "secondaryMuscles": [
      "biceps",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 38,
      "platinum": 52,
      "diamond": 68
    },
    "tips": [
      "Posiziona il busto quasi parallelo al pavimento e tira il bilanciere verso il fianco."
    ],
    "commonMistakes": [
      "Ruotare eccessivamente il busto per aggiungere inerzia al movimento."
    ]
  },
  {
    "id": "single-arm-lat-pulldown",
    "name": "Single Arm Lat Pulldown",
    "italianName": "Lat Machine Monolaterale ai Cavi",
    "muscle": "back",
    "secondaryMuscles": [
      "biceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 18,
      "gold": 26,
      "platinum": 36,
      "diamond": 46
    },
    "tips": [
      "Isola un lato alla volta per correggere eventuali squilibri di forza tra destra e sinistra."
    ],
    "commonMistakes": [
      "Inclinare eccessivamente il busto lateralmente per completare la ripetizione."
    ]
  },
  {
    "id": "machine-shoulder-press",
    "name": "Machine Shoulder Press",
    "italianName": "Shoulder Press alla Macchina",
    "muscle": "shoulders",
    "secondaryMuscles": [
      "triceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 30,
      "silver": 48,
      "gold": 68,
      "platinum": 90,
      "diamond": 115
    },
    "tips": [
      "Regola il sedile in modo che le maniglie partano all'altezza delle spalle."
    ],
    "commonMistakes": [
      "Spingere con un arco eccessivo della zona lombare invece che con le spalle."
    ]
  },
  {
    "id": "cable-front-raise",
    "name": "Cable Front Raise",
    "italianName": "Alzate Frontali ai Cavi",
    "muscle": "shoulders",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 15,
      "platinum": 21,
      "diamond": 28
    },
    "tips": [
      "La tensione costante del cavo rende l'esercizio più impegnativo del manubrio in tutto il ROM."
    ],
    "commonMistakes": [
      "Usare lo slancio del busto per portare su il peso."
    ]
  },
  {
    "id": "seated-dumbbell-lateral-raise",
    "name": "Seated Dumbbell Lateral Raise",
    "italianName": "Alzate Laterali da Seduto con Manubri",
    "muscle": "shoulders",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 14,
      "platinum": 19,
      "diamond": 25
    },
    "tips": [
      "La posizione da seduto elimina lo slancio delle gambe, isolando meglio il deltoide laterale."
    ],
    "commonMistakes": [
      "Alzare i manubri oltre l'altezza delle spalle coinvolgendo il trapezio."
    ]
  },
  {
    "id": "cable-rear-delt-fly",
    "name": "Cable Rear Delt Fly",
    "italianName": "Aperture Posteriori ai Cavi Incrociati",
    "muscle": "shoulders",
    "secondaryMuscles": [
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 11,
      "gold": 16,
      "platinum": 22,
      "diamond": 29
    },
    "tips": [
      "Incrocia i cavi davanti al corpo per aumentare l'allungamento del deltoide posteriore."
    ],
    "commonMistakes": [
      "Piegare troppo i gomiti trasformando il movimento in una trazione dorsale."
    ]
  },
  {
    "id": "seated-barbell-military-press",
    "name": "Seated Barbell Military Press",
    "italianName": "Military Press da Seduto con Bilanciere",
    "muscle": "shoulders",
    "secondaryMuscles": [
      "triceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 25,
      "silver": 40,
      "gold": 58,
      "platinum": 78,
      "diamond": 98
    },
    "tips": [
      "Lo schienale verticale stabilizza il busto permettendo di caricare più peso in sicurezza."
    ],
    "commonMistakes": [
      "Inarcare eccessivamente la zona lombare per completare la spinta."
    ]
  },
  {
    "id": "machine-lateral-raise",
    "name": "Machine Lateral Raise",
    "italianName": "Alzate Laterali alla Macchina",
    "muscle": "shoulders",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 35,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "Mantieni una leggera pausa in massima contrazione per massimizzare lo stimolo sul deltoide."
    ],
    "commonMistakes": [
      "Usare un carico eccessivo che costringe a spingere con il trapezio."
    ]
  },
  {
    "id": "pike-push-up",
    "name": "Pike Push-Up",
    "italianName": "Piegamenti a V per Spalle",
    "muscle": "shoulders",
    "secondaryMuscles": [
      "triceps"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 16,
      "gold": 28,
      "platinum": 42,
      "diamond": 58
    },
    "tips": [
      "Più i piedi sono elevati, più l'esercizio si avvicina a una verticale, aumentando il carico sulle spalle."
    ],
    "commonMistakes": [
      "Flettere troppo le braccia lateralmente invece che verso la fronte."
    ]
  },
  {
    "id": "dumbbell-cuban-press",
    "name": "Dumbbell Cuban Press",
    "italianName": "Cuban Press con Manubri",
    "muscle": "shoulders",
    "secondaryMuscles": [
      "back"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 75,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 8,
      "gold": 12,
      "platinum": 17,
      "diamond": 22
    },
    "tips": [
      "Esercizio eccellente per la salute della cuffia dei rotatori: usa un carico leggero e controllato."
    ],
    "commonMistakes": [
      "Aumentare troppo il peso perdendo il controllo della fase di rotazione esterna."
    ]
  },
  {
    "id": "smith-machine-squat",
    "name": "Smith Machine Squat",
    "italianName": "Squat al Multipower",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 150,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 40,
      "silver": 65,
      "gold": 90,
      "platinum": 120,
      "diamond": 150
    },
    "tips": [
      "La guida fissa del bilanciere permette di concentrarti sulla profondità e sul controllo del movimento."
    ],
    "commonMistakes": [
      "Posizionare i piedi troppo indietro rispetto alla traiettoria verticale del bilanciere guidato."
    ]
  },
  {
    "id": "vertical-leg-press",
    "name": "Vertical Leg Press",
    "italianName": "Leg Press Verticale",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 60,
      "silver": 100,
      "gold": 140,
      "platinum": 180,
      "diamond": 220
    },
    "tips": [
      "La spinta verticale aumenta il coinvolgimento dei quadricipiti rispetto alla leg press inclinata."
    ],
    "commonMistakes": [
      "Scendere troppo facendo staccare i glutei dal sedile."
    ]
  },
  {
    "id": "dumbbell-lunges",
    "name": "Dumbbell Lunges",
    "italianName": "Affondi con Manubri",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 90,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 16,
      "gold": 24,
      "platinum": 32,
      "diamond": 42
    },
    "tips": [
      "Mantieni il busto eretto e il ginocchio anteriore allineato con la caviglia."
    ],
    "commonMistakes": [
      "Far toccare il ginocchio posteriore a terra con troppa forza a ogni ripetizione."
    ]
  },
  {
    "id": "barbell-walking-lunges",
    "name": "Barbell Walking Lunges",
    "italianName": "Affondi Camminati con Bilanciere",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 20,
      "silver": 35,
      "gold": 50,
      "platinum": 68,
      "diamond": 85
    },
    "tips": [
      "Fai un passo lungo e disceso controllato, spingendo poi con il tallone anteriore per avanzare."
    ],
    "commonMistakes": [
      "Fare passi troppo corti che spostano il lavoro sul ginocchio invece che sull'anca."
    ]
  },
  {
    "id": "sissy-squat",
    "name": "Sissy Squat",
    "italianName": "Sissy Squat a Corpo Libero",
    "muscle": "quads",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 20,
      "platinum": 30,
      "diamond": 42
    },
    "tips": [
      "Inclina il busto indietro mantenendo anche e ginocchia allineate per isolare il quadricipite."
    ],
    "commonMistakes": [
      "Piegare eccessivamente il bacino trasformando il movimento in uno squat classico."
    ]
  },
  {
    "id": "cable-front-squat",
    "name": "Cable Front Squat",
    "italianName": "Front Squat ai Cavi",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 28,
      "gold": 42,
      "platinum": 58,
      "diamond": 75
    },
    "tips": [
      "La trazione frontale del cavo aiuta a mantenere il busto eretto durante la discesa."
    ],
    "commonMistakes": [
      "Lasciare che i gomiti cadano in basso perdendo la posizione del busto."
    ]
  },
  {
    "id": "barbell-zercher-squat",
    "name": "Barbell Zercher Squat",
    "italianName": "Zercher Squat con Bilanciere",
    "muscle": "quads",
    "secondaryMuscles": [
      "back",
      "abs"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 150,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 20,
      "silver": 35,
      "gold": 52,
      "platinum": 70,
      "diamond": 90
    },
    "tips": [
      "Tieni il bilanciere nella piega dei gomiti e il busto il più verticale possibile."
    ],
    "commonMistakes": [
      "Appoggiare il bilanciere troppo in basso sull'avambraccio causando dolore e perdita di controllo."
    ]
  },
  {
    "id": "barbell-bulgarian-split-squat",
    "name": "Barbell Bulgarian Split Squat",
    "italianName": "Bulgarian Split Squat con Bilanciere",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 28,
      "gold": 42,
      "platinum": 58,
      "diamond": 75
    },
    "tips": [
      "Appoggia il piede posteriore su un rialzo e scendi verticalmente sulla gamba anteriore."
    ],
    "commonMistakes": [
      "Spingere troppo con la gamba posteriore invece di isolare quella anteriore."
    ]
  },
  {
    "id": "belt-squat-machine",
    "name": "Belt Squat Machine",
    "italianName": "Belt Squat alla Macchina",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 30,
      "silver": 50,
      "gold": 72,
      "platinum": 95,
      "diamond": 120
    },
    "tips": [
      "Il carico applicato al bacino scarica completamente la colonna vertebrale."
    ],
    "commonMistakes": [
      "Non scendere a sufficienza per il timore di perdere l'equilibrio sui rialzi laterali."
    ]
  },
  {
    "id": "wall-sit",
    "name": "Wall Sit",
    "italianName": "Sedia Isometrica al Muro",
    "muscle": "quads",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 20,
      "gold": 35,
      "platinum": 50,
      "diamond": 65
    },
    "tips": [
      "Mantieni le ginocchia a 90° e la schiena completamente appoggiata al muro per tutta la durata."
    ],
    "commonMistakes": [
      "Appoggiarsi con le mani sulle cosce per alleggerire il carico durante la tenuta."
    ]
  },
  {
    "id": "dumbbell-step-up",
    "name": "Dumbbell Step-Up",
    "italianName": "Step-Up con Manubri per Quadricipiti",
    "muscle": "quads",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 90,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 16,
      "gold": 24,
      "platinum": 32,
      "diamond": 42
    },
    "tips": [
      "Spingi con il tallone del piede appoggiato sul box, evitando di spingere con la gamba a terra."
    ],
    "commonMistakes": [
      "Usare un box troppo alto compensando con uno slancio del bacino."
    ]
  },
  {
    "id": "dumbbell-romanian-deadlift",
    "name": "Dumbbell Romanian Deadlift",
    "italianName": "Stacco Rumeno con Manubri",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "back"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 120,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 18,
      "silver": 28,
      "gold": 40,
      "platinum": 52,
      "diamond": 66
    },
    "tips": [
      "Fai scorrere i manubri lungo le cosce mantenendo la schiena neutra durante la discesa."
    ],
    "commonMistakes": [
      "Piegare troppo le ginocchia trasformando il movimento in uno squat."
    ]
  },
  {
    "id": "single-leg-dumbbell-romanian-deadlift",
    "name": "Single Leg Dumbbell Romanian Deadlift",
    "italianName": "Stacco Rumeno Monopodalico con Manubri",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 90,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Mantieni il bacino il più possibile parallelo al pavimento durante l'estensione della gamba posteriore."
    ],
    "commonMistakes": [
      "Ruotare il bacino lateralmente perdendo l'allineamento dell'anca."
    ]
  },
  {
    "id": "cable-pull-through",
    "name": "Cable Pull-Through",
    "italianName": "Pull-Through ai Cavi",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 38,
      "platinum": 52,
      "diamond": 68
    },
    "tips": [
      "Spingi i fianchi indietro mantenendo le braccia rilassate, il movimento parte dall'anca."
    ],
    "commonMistakes": [
      "Piegare le braccia tirando con la schiena invece che con l'anca."
    ]
  },
  {
    "id": "glute-ham-raise",
    "name": "Glute Ham Raise",
    "italianName": "Glute Ham Raise alla Panca GHD",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 15,
      "gold": 28,
      "platinum": 42,
      "diamond": 58
    },
    "tips": [
      "Controlla la fase eccentrica il più a lungo possibile per il massimo stimolo sui femorali."
    ],
    "commonMistakes": [
      "Usare le braccia per spingersi su invece di contrarre attivamente i femorali."
    ]
  },
  {
    "id": "nordic-hamstring-curl",
    "name": "Nordic Hamstring Curl",
    "italianName": "Nordic Curl a Corpo Libero",
    "muscle": "hamstrings",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 22,
      "platinum": 35,
      "diamond": 50
    },
    "tips": [
      "Scendi il più lentamente possibile controllando il movimento con i soli femorali."
    ],
    "commonMistakes": [
      "Piegare il bacino invece di mantenere una linea retta ginocchia-spalle."
    ]
  },
  {
    "id": "standing-cable-leg-curl",
    "name": "Standing Cable Leg Curl",
    "italianName": "Leg Curl in Piedi ai Cavi",
    "muscle": "hamstrings",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Mantieni il bacino fermo e porta il tallone verso il gluteo senza inarcare la schiena."
    ],
    "commonMistakes": [
      "Usare lo slancio del bacino per completare la flessione del ginocchio."
    ]
  },
  {
    "id": "smith-machine-romanian-deadlift",
    "name": "Smith Machine Romanian Deadlift",
    "italianName": "Stacco Rumeno al Multipower",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 25,
      "silver": 42,
      "gold": 60,
      "platinum": 80,
      "diamond": 100
    },
    "tips": [
      "La guida fissa aiuta a mantenere la traiettoria verticale del bilanciere durante la discesa."
    ],
    "commonMistakes": [
      "Spingere i fianchi in avanti troppo presto accorciando il ROM."
    ]
  },
  {
    "id": "barbell-single-leg-deadlift",
    "name": "Barbell Single Leg Deadlift",
    "italianName": "Stacco Monopodalico con Bilanciere",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 38,
      "platinum": 50,
      "diamond": 65
    },
    "tips": [
      "Mantieni il bilanciere vicino alla gamba di appoggio per tutto il movimento."
    ],
    "commonMistakes": [
      "Perdere l'equilibrio ruotando il bacino verso l'esterno."
    ]
  },
  {
    "id": "stability-ball-leg-curl",
    "name": "Stability Ball Leg Curl",
    "italianName": "Leg Curl su Swiss Ball",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 20,
      "platinum": 30,
      "diamond": 42
    },
    "tips": [
      "Solleva il bacino e fai rotolare la palla verso i glutei mantenendo il core stabile."
    ],
    "commonMistakes": [
      "Far cadere il bacino verso il pavimento durante l'esecuzione."
    ]
  },
  {
    "id": "dumbbell-good-morning",
    "name": "Dumbbell Good Morning",
    "italianName": "Good Morning con Manubrio",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "back",
      "glutes"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 18,
      "gold": 28,
      "platinum": 38,
      "diamond": 50
    },
    "tips": [
      "Mantieni una leggera flessione delle ginocchia e piega il busto in avanti dall'anca."
    ],
    "commonMistakes": [
      "Arrotondare la schiena durante la flessione del busto."
    ]
  },
  {
    "id": "reverse-hyperextension",
    "name": "Reverse Hyperextension",
    "italianName": "Hyperextension Inversa alla Macchina",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 20,
      "gold": 32,
      "platinum": 45,
      "diamond": 60
    },
    "tips": [
      "Solleva le gambe in estensione dall'anca mantenendo il busto fermo sul supporto."
    ],
    "commonMistakes": [
      "Usare uno slancio eccessivo delle gambe invece di un movimento controllato."
    ]
  },
  {
    "id": "prone-leg-curl-single-leg",
    "name": "Single Leg Prone Leg Curl",
    "italianName": "Leg Curl Prono Monopodalico",
    "muscle": "hamstrings",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Lavorare una gamba alla volta permette di correggere squilibri di forza tra i due lati."
    ],
    "commonMistakes": [
      "Sollevare il bacino dal supporto durante la fase di curl."
    ]
  },
  {
    "id": "cable-romanian-deadlift",
    "name": "Cable Romanian Deadlift",
    "italianName": "Stacco Rumeno ai Cavi",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 38,
      "platinum": 50,
      "diamond": 65
    },
    "tips": [
      "La tensione costante del cavo mantiene i femorali sotto carico anche in posizione eretta."
    ],
    "commonMistakes": [
      "Bloccare le ginocchia completamente durante la discesa."
    ]
  },
  {
    "id": "deficit-stiff-leg-deadlift",
    "name": "Deficit Stiff Leg Deadlift",
    "italianName": "Stacco a Gambe Tese in Deficit",
    "muscle": "hamstrings",
    "secondaryMuscles": [
      "glutes",
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 150,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 25,
      "silver": 42,
      "gold": 60,
      "platinum": 80,
      "diamond": 102
    },
    "tips": [
      "Il rialzo sotto i piedi aumenta il ROM disponibile, aumentando lo stiramento dei femorali."
    ],
    "commonMistakes": [
      "Arrotondare la parte bassa della schiena per raggiungere il pavimento."
    ]
  },
  {
    "id": "seated-single-leg-curl",
    "name": "Seated Single Leg Curl",
    "italianName": "Leg Curl da Seduto Monopodalico",
    "muscle": "hamstrings",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Punta il piede verso di te durante la flessione per massimizzare il reclutamento dei femorali."
    ],
    "commonMistakes": [
      "Sollevare il bacino dal sedile per generare più forza con lo slancio."
    ]
  },
  {
    "id": "smith-machine-hip-thrust",
    "name": "Smith Machine Hip Thrust",
    "italianName": "Hip Thrust al Multipower",
    "muscle": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 30,
      "silver": 50,
      "gold": 72,
      "platinum": 95,
      "diamond": 120
    },
    "tips": [
      "Appoggia la parte alta della schiena su una panca e spingi il bacino verso l'alto contraendo i glutei."
    ],
    "commonMistakes": [
      "Iperestendere la zona lombare invece di terminare il movimento con l'anca."
    ]
  },
  {
    "id": "single-leg-hip-thrust",
    "name": "Single Leg Hip Thrust",
    "italianName": "Hip Thrust Monopodalico",
    "muscle": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 22,
      "platinum": 35,
      "diamond": 48
    },
    "tips": [
      "Mantieni il bacino parallelo al pavimento senza ruotare verso il lato di appoggio."
    ],
    "commonMistakes": [
      "Spingere principalmente con la gamba a terra invece che con quella di lavoro."
    ]
  },
  {
    "id": "sumo-deadlift",
    "name": "Sumo Deadlift",
    "italianName": "Stacco da Terra Sumo",
    "muscle": "glutes",
    "secondaryMuscles": [
      "hamstrings",
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 180,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 60,
      "silver": 95,
      "gold": 130,
      "platinum": 165,
      "diamond": 205
    },
    "tips": [
      "Stance larga con punte dei piedi ruotate verso l'esterno, spingi le ginocchia in fuori durante la trazione."
    ],
    "commonMistakes": [
      "Sollevare i fianchi troppo velocemente rispetto alle spalle, trasformando lo stacco in uno squat."
    ]
  },
  {
    "id": "cable-hip-abduction",
    "name": "Cable Hip Abduction",
    "italianName": "Abduzione d'Anca ai Cavi",
    "muscle": "glutes",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 9,
      "gold": 14,
      "platinum": 20,
      "diamond": 26
    },
    "tips": [
      "Mantieni il busto stabile e allontana la gamba lateralmente contraendo il medio gluteo."
    ],
    "commonMistakes": [
      "Inclinare eccessivamente il busto per generare più ampiezza di movimento."
    ]
  },
  {
    "id": "dumbbell-sumo-squat",
    "name": "Dumbbell Sumo Squat",
    "italianName": "Sumo Squat con Manubrio",
    "muscle": "glutes",
    "secondaryMuscles": [
      "quads",
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 24,
      "gold": 34,
      "platinum": 45,
      "diamond": 58
    },
    "tips": [
      "Tieni il manubrio con entrambe le mani tra le gambe e scendi con le ginocchia in fuori."
    ],
    "commonMistakes": [
      "Scendere con il busto troppo inclinato in avanti."
    ]
  },
  {
    "id": "curtsy-lunge",
    "name": "Curtsy Lunge",
    "italianName": "Affondo Incrociato con Manubri",
    "muscle": "glutes",
    "secondaryMuscles": [
      "quads"
    ],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 75,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Porta la gamba posteriore incrociata dietro a quella anteriore per enfatizzare il medio gluteo."
    ],
    "commonMistakes": [
      "Ruotare eccessivamente il bacino invece di mantenerlo frontale."
    ]
  },
  {
    "id": "frog-pump",
    "name": "Frog Pump",
    "italianName": "Frog Pump a Corpo Libero",
    "muscle": "glutes",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 22,
      "platinum": 32,
      "diamond": 44
    },
    "tips": [
      "Unisci le piante dei piedi e spingi il bacino verso l'alto contraendo forte i glutei al picco."
    ],
    "commonMistakes": [
      "Eseguire il movimento troppo velocemente perdendo la contrazione di picco."
    ]
  },
  {
    "id": "barbell-step-up",
    "name": "Barbell Step-Up",
    "italianName": "Step-Up con Bilanciere",
    "muscle": "glutes",
    "secondaryMuscles": [
      "quads"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 26,
      "gold": 38,
      "platinum": 52,
      "diamond": 68
    },
    "tips": [
      "Posiziona il bilanciere come in uno squat e sali su un rialzo stabile spingendo con il tallone."
    ],
    "commonMistakes": [
      "Usare il piede a terra per spingersi invece di isolare la gamba sul rialzo."
    ]
  },
  {
    "id": "reverse-lunge-cable",
    "name": "Cable Reverse Lunge",
    "italianName": "Affondo Indietro ai Cavi",
    "muscle": "glutes",
    "secondaryMuscles": [
      "quads"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "La resistenza del cavo davanti al corpo aggiunge tensione costante durante l'affondo."
    ],
    "commonMistakes": [
      "Fare un passo indietro troppo corto riducendo il coinvolgimento del gluteo."
    ]
  },
  {
    "id": "seated-hip-adduction-machine",
    "name": "Seated Hip Adduction Machine",
    "italianName": "Adductor Machine da Seduto",
    "muscle": "glutes",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 30,
      "silver": 48,
      "gold": 68,
      "platinum": 90,
      "diamond": 112
    },
    "tips": [
      "Chiudi le gambe con un movimento controllato senza usare slanci."
    ],
    "commonMistakes": [
      "Aprire eccessivamente le gambe in fase eccentrica perdendo il controllo del carico."
    ]
  },
  {
    "id": "glute-focused-leg-press",
    "name": "Glute Focused Leg Press",
    "italianName": "Leg Press con Stance Alta per Glutei",
    "muscle": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 50,
      "silver": 85,
      "gold": 120,
      "platinum": 155,
      "diamond": 195
    },
    "tips": [
      "Posiziona i piedi in alto sulla pedana per spostare il lavoro su glutei e femorali."
    ],
    "commonMistakes": [
      "Sollevare i talloni dalla pedana durante la spinta."
    ]
  },
  {
    "id": "b-stance-hip-thrust-dumbbell",
    "name": "B-Stance Hip Thrust con Manubrio",
    "italianName": "B-Stance Hip Thrust con Manubrio",
    "muscle": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 18,
      "gold": 28,
      "platinum": 38,
      "diamond": 50
    },
    "tips": [
      "Sposta la maggior parte del carico su una gamba mantenendo l'altra come semplice appoggio."
    ],
    "commonMistakes": [
      "Distribuire il peso equamente tra le due gambe vanificando l'enfasi monolaterale."
    ]
  },
  {
    "id": "single-leg-cable-kickback",
    "name": "Single Leg Cable Kickback",
    "italianName": "Kickback ai Cavi Monopodalico",
    "muscle": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 15,
      "platinum": 21,
      "diamond": 28
    },
    "tips": [
      "Mantieni il bacino fermo e spingi la gamba indietro contraendo il gluteo al termine del movimento."
    ],
    "commonMistakes": [
      "Inarcare la schiena per aumentare l'ampiezza del calcio all'indietro."
    ]
  },
  {
    "id": "glute-bridge-marching",
    "name": "Glute Bridge March",
    "italianName": "Glute Bridge con Marcia",
    "muscle": "glutes",
    "secondaryMuscles": [
      "abs"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 10,
      "gold": 18,
      "platinum": 26,
      "diamond": 36
    },
    "tips": [
      "Mantieni il bacino sollevato e stabile mentre alterni il sollevamento delle ginocchia."
    ],
    "commonMistakes": [
      "Far scendere il bacino ad ogni sollevamento della gamba."
    ]
  },
  {
    "id": "machine-donkey-kick",
    "name": "Machine Donkey Kick",
    "italianName": "Donkey Kick alla Macchina",
    "muscle": "glutes",
    "secondaryMuscles": [
      "hamstrings"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 36,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "Spingi con il tallone verso il soffitto mantenendo il ginocchio piegato a 90°."
    ],
    "commonMistakes": [
      "Iperestendere la schiena per aumentare l'ampiezza del movimento."
    ]
  },
  {
    "id": "ez-bar-curl",
    "name": "EZ Bar Curl",
    "italianName": "Curl con Bilanciere EZ Presa Larga",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 24,
      "gold": 34,
      "platinum": 45,
      "diamond": 58
    },
    "tips": [
      "La presa angolata dell'EZ bar riduce lo stress sui polsi rispetto al bilanciere dritto."
    ],
    "commonMistakes": [
      "Aprire i gomiti lateralmente durante la salita."
    ]
  },
  {
    "id": "machine-preacher-curl",
    "name": "Machine Preacher Curl",
    "italianName": "Preacher Curl alla Macchina",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 36,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "Il supporto fisso elimina lo slancio, isolando completamente il bicipite."
    ],
    "commonMistakes": [
      "Non estendere completamente il braccio in fase eccentrica."
    ]
  },
  {
    "id": "cable-hammer-curl-rope",
    "name": "Cable Hammer Curl",
    "italianName": "Curl a Martello ai Cavi con Corda",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "La corda mantiene la presa neutra per tutto il movimento, enfatizzando il brachiale."
    ],
    "commonMistakes": [
      "Allontanare i gomiti dal busto durante la risalita."
    ]
  },
  {
    "id": "dumbbell-drag-curl",
    "name": "Dumbbell Drag Curl",
    "italianName": "Drag Curl con Manubri",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 13,
      "gold": 19,
      "platinum": 26,
      "diamond": 34
    },
    "tips": [
      "Fai scorrere i manubri lungo il busto mantenendo i gomiti dietro la linea delle spalle."
    ],
    "commonMistakes": [
      "Allontanare i manubri dal corpo trasformando il curl in uno standard."
    ]
  },
  {
    "id": "cable-preacher-curl",
    "name": "Cable Preacher Curl",
    "italianName": "Preacher Curl ai Cavi",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "La tensione costante del cavo mantiene il bicipite sotto carico anche in massima contrazione."
    ],
    "commonMistakes": [
      "Sollevare il gomito dal supporto durante la risalita."
    ]
  },
  {
    "id": "zottman-curl",
    "name": "Zottman Curl",
    "italianName": "Zottman Curl con Manubri",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 75,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 13,
      "gold": 19,
      "platinum": 26,
      "diamond": 34
    },
    "tips": [
      "Sali con presa supina e scendi con presa prona per allenare sia bicipite che avambraccio."
    ],
    "commonMistakes": [
      "Ruotare il polso troppo tardi perdendo il beneficio della fase eccentrica pronata."
    ]
  },
  {
    "id": "machine-bicep-curl",
    "name": "Machine Bicep Curl",
    "italianName": "Curl per Bicipiti alla Macchina",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 36,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "La traiettoria guidata permette di concentrarsi sulla contrazione muscolare pura."
    ],
    "commonMistakes": [
      "Usare uno slancio delle spalle per completare l'ultima parte della ripetizione."
    ]
  },
  {
    "id": "reverse-barbell-curl",
    "name": "Reverse Barbell Curl",
    "italianName": "Curl Inverso con Bilanciere",
    "muscle": "biceps",
    "secondaryMuscles": [
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 12,
      "silver": 20,
      "gold": 29,
      "platinum": 39,
      "diamond": 50
    },
    "tips": [
      "La presa prona sposta parte del lavoro su avambraccio e brachioradiale."
    ],
    "commonMistakes": [
      "Usare un carico eccessivo che costringe a flettere i polsi."
    ]
  },
  {
    "id": "single-arm-cable-curl",
    "name": "Single Arm Cable Curl",
    "italianName": "Curl Monolaterale ai Cavi",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 15,
      "platinum": 21,
      "diamond": 28
    },
    "tips": [
      "Mantieni il gomito fisso vicino al fianco per isolare completamente il bicipite."
    ],
    "commonMistakes": [
      "Ruotare il busto per generare slancio aggiuntivo."
    ]
  },
  {
    "id": "seated-dumbbell-curl",
    "name": "Seated Dumbbell Curl",
    "italianName": "Curl con Manubri da Seduto",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 16,
      "gold": 24,
      "platinum": 32,
      "diamond": 42
    },
    "tips": [
      "La posizione seduta elimina lo slancio delle gambe e della schiena."
    ],
    "commonMistakes": [
      "Appoggiare i gomiti sulle ginocchia perdendo tensione sul bicipite."
    ]
  },
  {
    "id": "bayesian-cable-curl",
    "name": "Bayesian Cable Curl",
    "italianName": "Curl ai Cavi con Braccio Esteso Dietro",
    "muscle": "biceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 15,
      "platinum": 21,
      "diamond": 28
    },
    "tips": [
      "Posizionati con la carrucola bassa e il braccio esteso dietro il busto per massimizzare l'allungamento."
    ],
    "commonMistakes": [
      "Portare il gomito troppo avanti perdendo la tensione in allungamento."
    ]
  },
  {
    "id": "chin-up-bicep-focus",
    "name": "Chin-Up (Bicep Focus)",
    "italianName": "Trazioni Presa Supina per Bicipiti",
    "muscle": "biceps",
    "secondaryMuscles": [
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 15,
      "gold": 28,
      "platinum": 42,
      "diamond": 58
    },
    "tips": [
      "La presa supina e stretta sposta maggiore enfasi sui bicipiti rispetto alla trazione standard."
    ],
    "commonMistakes": [
      "Non arrivare al mento sopra la barra ad ogni ripetizione."
    ]
  },
  {
    "id": "close-grip-bench-press",
    "name": "Close Grip Bench Press",
    "italianName": "Panca Presa Stretta per Tricipiti",
    "muscle": "triceps",
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 120,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 35,
      "silver": 55,
      "gold": 78,
      "platinum": 102,
      "diamond": 128
    },
    "tips": [
      "Mantieni una presa poco più stretta delle spalle e i gomiti vicini al busto durante la discesa."
    ],
    "commonMistakes": [
      "Usare una presa troppo stretta che sovraccarica eccessivamente i polsi."
    ]
  },
  {
    "id": "machine-triceps-extension",
    "name": "Machine Triceps Extension",
    "italianName": "Estensioni Tricipiti alla Macchina",
    "muscle": "triceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 20,
      "silver": 32,
      "gold": 46,
      "platinum": 60,
      "diamond": 78
    },
    "tips": [
      "Mantieni i gomiti fissi ai lati del supporto durante tutta l'estensione."
    ],
    "commonMistakes": [
      "Sollevare le spalle dal sedile per generare più forza."
    ]
  },
  {
    "id": "single-arm-cable-pushdown",
    "name": "Single Arm Cable Pushdown",
    "italianName": "Pushdown Monolaterale ai Cavi",
    "muscle": "triceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 15,
      "platinum": 21,
      "diamond": 28
    },
    "tips": [
      "Isola un braccio alla volta per correggere eventuali squilibri di forza."
    ],
    "commonMistakes": [
      "Ruotare il busto per aiutarsi con lo slancio."
    ]
  },
  {
    "id": "dumbbell-kickback",
    "name": "Dumbbell Kickback",
    "italianName": "Kickback per Tricipiti con Manubrio",
    "muscle": "triceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 9,
      "gold": 13,
      "platinum": 18,
      "diamond": 24
    },
    "tips": [
      "Mantieni il braccio parallelo al pavimento ed estendi solo l'avambraccio."
    ],
    "commonMistakes": [
      "Far scendere il gomito durante l'estensione perdendo la posizione fissa."
    ]
  },
  {
    "id": "rope-overhead-extension",
    "name": "Rope Overhead Extension",
    "italianName": "Estensioni Sopra la Testa alla Corda",
    "muscle": "triceps",
    "secondaryMuscles": [
      "chest"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 17,
      "gold": 25,
      "platinum": 34,
      "diamond": 44
    },
    "tips": [
      "Posizionati di spalle al cavo e estendi le braccia sopra la testa per il massimo allungamento del capo lungo."
    ],
    "commonMistakes": [
      "Aprire troppo i gomiti lateralmente durante l'estensione."
    ]
  },
  {
    "id": "diamond-push-up",
    "name": "Diamond Push-Up",
    "italianName": "Piegamenti a Diamante",
    "muscle": "triceps",
    "secondaryMuscles": [
      "chest"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 16,
      "gold": 28,
      "platinum": 42,
      "diamond": 58
    },
    "tips": [
      "Unisci pollici e indici a formare un diamante sotto lo sterno per massimizzare l'attivazione tricipiti."
    ],
    "commonMistakes": [
      "Allargare troppo i gomiti perdendo l'enfasi sui tricipiti."
    ]
  },
  {
    "id": "incline-dumbbell-triceps-extension",
    "name": "Incline Dumbbell Triceps Extension",
    "italianName": "Estensioni Tricipiti su Panca Inclinata",
    "muscle": "triceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 75,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 13,
      "gold": 19,
      "platinum": 26,
      "diamond": 34
    },
    "tips": [
      "La panca inclinata aumenta lo stiramento del capo lungo del tricipite in fase eccentrica."
    ],
    "commonMistakes": [
      "Muovere le spalle durante l'estensione invece di mantenerle fisse."
    ]
  },
  {
    "id": "cross-body-cable-extension",
    "name": "Cross Body Cable Extension",
    "italianName": "Estensioni Incrociate ai Cavi",
    "muscle": "triceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 15,
      "platinum": 21,
      "diamond": 28
    },
    "tips": [
      "Tira il cavo diagonalmente verso il fianco opposto per un angolo di lavoro diverso."
    ],
    "commonMistakes": [
      "Usare tutto il corpo per generare slancio invece di isolare il gomito."
    ]
  },
  {
    "id": "machine-assisted-dip",
    "name": "Assisted Dip Machine",
    "italianName": "Dip Machine Assistita",
    "muscle": "triceps",
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 20,
      "silver": 35,
      "gold": 52,
      "platinum": 70,
      "diamond": 90
    },
    "tips": [
      "Riduci gradualmente l'assistenza della macchina man mano che aumenta la forza."
    ],
    "commonMistakes": [
      "Scendere troppo velocemente senza controllo della fase eccentrica."
    ]
  },
  {
    "id": "close-grip-push-up",
    "name": "Close Grip Push-Up",
    "italianName": "Piegamenti Presa Stretta",
    "muscle": "triceps",
    "secondaryMuscles": [
      "chest"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 16,
      "gold": 28,
      "platinum": 42,
      "diamond": 58
    },
    "tips": [
      "Posiziona le mani sotto il petto con presa stretta per enfatizzare il tricipite."
    ],
    "commonMistakes": [
      "Far cedere i gomiti troppo verso l'esterno."
    ]
  },
  {
    "id": "two-hand-overhead-dumbbell-extension",
    "name": "Two Hand Overhead Dumbbell Extension",
    "italianName": "Estensioni Sopra la Testa a Due Mani",
    "muscle": "triceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 18,
      "gold": 26,
      "platinum": 36,
      "diamond": 46
    },
    "tips": [
      "Tieni il manubrio con entrambe le mani dietro la testa mantenendo i gomiti stretti e fissi."
    ],
    "commonMistakes": [
      "Aprire troppo i gomiti lateralmente durante la discesa del peso."
    ]
  },
  {
    "id": "bodyweight-bench-dips",
    "name": "Bench Dips (Corpo Libero)",
    "italianName": "Dip su Panca a Corpo Libero",
    "muscle": "triceps",
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 20,
      "platinum": 30,
      "diamond": 42
    },
    "tips": [
      "Mantieni i gomiti vicini al busto e scendi fino a un angolo di 90°."
    ],
    "commonMistakes": [
      "Scendere troppo in profondità sovraccaricando l'articolazione della spalla."
    ]
  },
  {
    "id": "cable-kickback",
    "name": "Cable Kickback",
    "italianName": "Kickback per Tricipiti ai Cavi",
    "muscle": "triceps",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 6,
      "silver": 10,
      "gold": 15,
      "platinum": 21,
      "diamond": 28
    },
    "tips": [
      "La tensione costante del cavo rende il kickback più efficace rispetto al manubrio."
    ],
    "commonMistakes": [
      "Piegare il gomito durante il ritorno perdendo tensione sul tricipite."
    ]
  },
  {
    "id": "smith-machine-calf-raise",
    "name": "Smith Machine Calf Raise",
    "italianName": "Calf Raise al Multipower",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 40,
      "silver": 65,
      "gold": 92,
      "platinum": 120,
      "diamond": 150
    },
    "tips": [
      "Posiziona un rialzo sotto gli avampiedi per aumentare il ROM disponibile."
    ],
    "commonMistakes": [
      "Molleggiare rapidamente senza fermarsi in massimo allungamento."
    ]
  },
  {
    "id": "donkey-calf-raise",
    "name": "Donkey Calf Raise",
    "italianName": "Calf Raise a Busto Flesso (Donkey)",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 35,
      "silver": 58,
      "gold": 82,
      "platinum": 108,
      "diamond": 135
    },
    "tips": [
      "L'inclinazione del busto in avanti aumenta lo stiramento del polpaccio in fase eccentrica."
    ],
    "commonMistakes": [
      "Non scendere completamente in allungamento ad ogni ripetizione."
    ]
  },
  {
    "id": "dumbbell-standing-calf-raise",
    "name": "Dumbbell Standing Calf Raise",
    "italianName": "Calf Raise in Piedi con Manubri",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 24,
      "gold": 34,
      "platinum": 45,
      "diamond": 58
    },
    "tips": [
      "Tieni i manubri lungo i fianchi e sali sulle punte spingendo con gli avampiedi."
    ],
    "commonMistakes": [
      "Piegare le ginocchia per aiutarsi con lo slancio."
    ]
  },
  {
    "id": "single-leg-dumbbell-calf-raise",
    "name": "Single Leg Dumbbell Calf Raise",
    "italianName": "Calf Raise Monopodalico con Manubrio",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "per_side",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Appoggiati a un supporto per l'equilibrio e lavora un polpaccio alla volta."
    ],
    "commonMistakes": [
      "Rimbalzare rapidamente senza controllo della fase negativa."
    ]
  },
  {
    "id": "barbell-standing-calf-raise",
    "name": "Barbell Standing Calf Raise",
    "italianName": "Calf Raise in Piedi con Bilanciere",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 30,
      "silver": 50,
      "gold": 72,
      "platinum": 95,
      "diamond": 120
    },
    "tips": [
      "Posiziona il bilanciere sulle trapezie come in uno squat e sali sulle punte."
    ],
    "commonMistakes": [
      "Usare un carico eccessivo che impedisce di raggiungere la massima estensione."
    ]
  },
  {
    "id": "bodyweight-standing-calf-raise",
    "name": "Bodyweight Standing Calf Raise",
    "italianName": "Calf Raise in Piedi a Corpo Libero",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 20,
      "gold": 35,
      "platinum": 50,
      "diamond": 65
    },
    "tips": [
      "Esegui il movimento lentamente concentrandoti sulla contrazione di picco."
    ],
    "commonMistakes": [
      "Eseguire il movimento troppo velocemente perdendo la tensione muscolare."
    ]
  },
  {
    "id": "single-leg-bodyweight-calf-raise",
    "name": "Single Leg Bodyweight Calf Raise",
    "italianName": "Calf Raise Monopodalico a Corpo Libero",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 16,
      "gold": 28,
      "platinum": 40,
      "diamond": 55
    },
    "tips": [
      "Usa un gradino per aumentare il ROM disponibile in fase di allungamento."
    ],
    "commonMistakes": [
      "Non scendere abbastanza in basso perdendo lo stiramento del tendine d'Achille."
    ]
  },
  {
    "id": "seated-dumbbell-calf-raise",
    "name": "Seated Dumbbell Calf Raise",
    "italianName": "Calf Raise da Seduto con Manubrio",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 18,
      "gold": 26,
      "platinum": 36,
      "diamond": 46
    },
    "tips": [
      "Posiziona il manubrio sulle ginocchia per enfatizzare il soleo con il ginocchio flesso."
    ],
    "commonMistakes": [
      "Sollevare solo parzialmente i talloni senza completare il movimento."
    ]
  },
  {
    "id": "cable-standing-calf-raise",
    "name": "Cable Standing Calf Raise",
    "italianName": "Calf Raise in Piedi ai Cavi",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 36,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "La tensione costante del cavo mantiene il polpaccio sotto carico durante tutto il ROM."
    ],
    "commonMistakes": [
      "Piegare le ginocchia riducendo il coinvolgimento del gastrocnemio."
    ]
  },
  {
    "id": "leg-press-single-leg-calf-raise",
    "name": "Leg Press Single Leg Calf Raise",
    "italianName": "Calf Raise Monopodalico alla Leg Press",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 20,
      "silver": 34,
      "gold": 48,
      "platinum": 64,
      "diamond": 82
    },
    "tips": [
      "Posiziona solo l'avampiede sul bordo della pedana e spingi con un solo arto alla volta."
    ],
    "commonMistakes": [
      "Bloccare completamente il ginocchio scaricando il lavoro sull'articolazione."
    ]
  },
  {
    "id": "hack-squat-calf-raise",
    "name": "Hack Squat Calf Raise",
    "italianName": "Calf Raise sulla Pedana Hack Squat",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 30,
      "silver": 50,
      "gold": 72,
      "platinum": 95,
      "diamond": 120
    },
    "tips": [
      "Usa la pedana dell'hack squat come rialzo per un allungamento extra del polpaccio."
    ],
    "commonMistakes": [
      "Molleggiare rapidamente senza controllo della fase eccentrica."
    ]
  },
  {
    "id": "plate-loaded-calf-raise-machine",
    "name": "Plate Loaded Calf Raise Machine",
    "italianName": "Calf Raise alla Macchina a Piastre",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 35,
      "silver": 58,
      "gold": 82,
      "platinum": 108,
      "diamond": 135
    },
    "tips": [
      "Regola la profondità del movimento in base alla mobilità della caviglia."
    ],
    "commonMistakes": [
      "Caricare troppo peso limitando il range di movimento completo."
    ]
  },
  {
    "id": "barbell-seated-calf-raise",
    "name": "Barbell Seated Calf Raise",
    "italianName": "Calf Raise da Seduto con Bilanciere",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 36,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "Appoggia il bilanciere sulle ginocchia e solleva i talloni mantenendo le ginocchia a 90°."
    ],
    "commonMistakes": [
      "Usare un carico che impedisce di raggiungere la massima contrazione."
    ]
  },
  {
    "id": "cable-seated-calf-raise",
    "name": "Cable Seated Calf Raise",
    "italianName": "Calf Raise da Seduto ai Cavi",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 12,
      "silver": 20,
      "gold": 30,
      "platinum": 40,
      "diamond": 52
    },
    "tips": [
      "Tieni il cavo teso sulle ginocchia per mantenere tensione costante sul soleo."
    ],
    "commonMistakes": [
      "Sollevare solo parzialmente i talloni ad ogni ripetizione."
    ]
  },
  {
    "id": "dumbbell-toe-raise",
    "name": "Dumbbell Toe Raise",
    "italianName": "Toe Raise (Tibiale Anteriore) con Manubrio",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 9,
      "gold": 14,
      "platinum": 20,
      "diamond": 26
    },
    "tips": [
      "Solleva le punte dei piedi tenendo i talloni a terra per allenare il tibiale anteriore."
    ],
    "commonMistakes": [
      "Sollevare tutto il piede invece di isolare la flessione della caviglia."
    ]
  },
  {
    "id": "standing-tibialis-raise-bodyweight",
    "name": "Standing Tibialis Raise",
    "italianName": "Sollevamento Punte in Piedi (Tibiale)",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 10,
      "gold": 18,
      "platinum": 26,
      "diamond": 36
    },
    "tips": [
      "Appoggia i talloni a un rialzo e solleva le punte il più possibile verso lo stinco."
    ],
    "commonMistakes": [
      "Piegare le ginocchia per compensare la mancanza di mobilità della caviglia."
    ]
  },
  {
    "id": "staircase-calf-raise-bodyweight",
    "name": "Staircase Calf Raise",
    "italianName": "Calf Raise sulle Scale a Corpo Libero",
    "muscle": "calves",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 20,
      "gold": 35,
      "platinum": 50,
      "diamond": 65
    },
    "tips": [
      "Usa il gradino di una scala per ottenere un allungamento maggiore in fase eccentrica."
    ],
    "commonMistakes": [
      "Appoggiarsi troppo al corrimano scaricando il peso dalle gambe."
    ]
  },
  {
    "id": "machine-ab-crunch",
    "name": "Machine Ab Crunch",
    "italianName": "Crunch alla Macchina",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 20,
      "silver": 35,
      "gold": 52,
      "platinum": 70,
      "diamond": 90
    },
    "tips": [
      "Piega il busto in avanti partendo dallo sterno, non tirando con le braccia sulle maniglie."
    ],
    "commonMistakes": [
      "Usare le braccia per tirare la leva invece di contrarre l'addome."
    ]
  },
  {
    "id": "captain-chair-leg-raise",
    "name": "Captain's Chair Leg Raise",
    "italianName": "Sollevamento Gambe alla Sedia Romana",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 20,
      "platinum": 30,
      "diamond": 40
    },
    "tips": [
      "Appoggia bene la schiena allo schienale e solleva le ginocchia verso il petto con retroversione del bacino."
    ],
    "commonMistakes": [
      "Dondolare il busto per generare slancio anziché usare la forza addominale."
    ]
  },
  {
    "id": "dumbbell-side-bend",
    "name": "Dumbbell Side Bend",
    "italianName": "Piegamenti Laterali con Manubrio",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 18,
      "gold": 26,
      "platinum": 36,
      "diamond": 46
    },
    "tips": [
      "Tieni il manubrio con un braccio e piega lateralmente il busto contraendo l'obliquo opposto."
    ],
    "commonMistakes": [
      "Usare un carico eccessivo che sposta il lavoro sulla zona lombare."
    ]
  },
  {
    "id": "cable-standing-crunch",
    "name": "Cable Standing Crunch",
    "italianName": "Crunch in Piedi ai Cavi",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 10,
      "silver": 18,
      "gold": 26,
      "platinum": 36,
      "diamond": 46
    },
    "tips": [
      "Mantieni i fianchi fermi e piega il busto in avanti flettendo solo la colonna toracica."
    ],
    "commonMistakes": [
      "Piegare le anche invece della colonna vertebrale durante il crunch."
    ]
  },
  {
    "id": "reverse-crunch",
    "name": "Reverse Crunch",
    "italianName": "Crunch Inverso a Corpo Libero",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 45,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 10,
      "gold": 18,
      "platinum": 26,
      "diamond": 36
    },
    "tips": [
      "Solleva il bacino verso il petto arrotolando la colonna vertebrale dal basso verso l'alto."
    ],
    "commonMistakes": [
      "Usare lo slancio delle gambe invece di sollevare il bacino con l'addome."
    ]
  },
  {
    "id": "sit-up-weighted",
    "name": "Weighted Sit-Up",
    "italianName": "Sit-Up Zavorrato",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "dumbbell",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 10,
      "gold": 16,
      "platinum": 24,
      "diamond": 32
    },
    "tips": [
      "Tieni il disco o manubrio al petto e sali con un movimento controllato senza slanci."
    ],
    "commonMistakes": [
      "Tirare il collo con le mani per completare la risalita."
    ]
  },
  {
    "id": "dragon-flag",
    "name": "Dragon Flag",
    "italianName": "Dragon Flag a Corpo Libero",
    "muscle": "abs",
    "secondaryMuscles": [
      "back"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 90,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 12,
      "gold": 22,
      "platinum": 35,
      "diamond": 50
    },
    "tips": [
      "Mantieni il corpo rigido come una tavola, controllando la discesa il più lentamente possibile."
    ],
    "commonMistakes": [
      "Piegare le anche durante la discesa perdendo la rigidità del corpo."
    ]
  },
  {
    "id": "barbell-rollout",
    "name": "Barbell Ab Rollout",
    "italianName": "Rollout Addominale con Bilanciere",
    "muscle": "abs",
    "secondaryMuscles": [
      "back",
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 75,
    "equipment": "barbell",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 15,
      "gold": 25,
      "platinum": 40,
      "diamond": 55
    },
    "tips": [
      "In ginocchio, fai rotolare il bilanciere in avanti mantenendo il bacino retroverso."
    ],
    "commonMistakes": [
      "Inarcare la schiena a ponte facendo cedere la zona lombare."
    ]
  },
  {
    "id": "hanging-knee-raise",
    "name": "Hanging Knee Raise",
    "italianName": "Sollevamento Ginocchia alla Sbarra",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 10,
      "gold": 18,
      "platinum": 26,
      "diamond": 36
    },
    "tips": [
      "Solleva le ginocchia verso il petto con retroversione del bacino per un migliore reclutamento addominale."
    ],
    "commonMistakes": [
      "Dondolare il corpo usando lo slancio anziché contrarre l'addome."
    ]
  },
  {
    "id": "cable-pallof-press",
    "name": "Cable Pallof Press",
    "italianName": "Pallof Press ai Cavi",
    "muscle": "abs",
    "secondaryMuscles": [
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "cable",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 14,
      "gold": 20,
      "platinum": 28,
      "diamond": 36
    },
    "tips": [
      "Resisti alla rotazione del busto spingendo il cavo lontano dal corpo mantenendo i fianchi fermi."
    ],
    "commonMistakes": [
      "Lasciare ruotare il busto verso il lato del cavo invece di resistere alla rotazione."
    ]
  },
  {
    "id": "v-up",
    "name": "V-Up",
    "italianName": "V-Up a Corpo Libero",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 5,
      "silver": 10,
      "gold": 18,
      "platinum": 26,
      "diamond": 36
    },
    "tips": [
      "Solleva contemporaneamente busto e gambe tese cercando di toccare le caviglie con le mani."
    ],
    "commonMistakes": [
      "Piegare eccessivamente le ginocchia riducendo il lavoro addominale."
    ]
  },
  {
    "id": "machine-torso-rotation",
    "name": "Machine Torso Rotation",
    "italianName": "Rotazione del Busto alla Macchina",
    "muscle": "abs",
    "secondaryMuscles": [],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "machine",
    "standard1RMBenchmarkKg": {
      "bronze": 15,
      "silver": 25,
      "gold": 36,
      "platinum": 48,
      "diamond": 62
    },
    "tips": [
      "Ruota il busto mantenendo i fianchi fermi per isolare gli obliqui."
    ],
    "commonMistakes": [
      "Ruotare anche il bacino vanificando l'isolamento degli obliqui."
    ]
  },
  {
    "id": "side-plank",
    "name": "Side Plank",
    "italianName": "Plank Laterale Isometrico",
    "muscle": "abs",
    "secondaryMuscles": [
      "shoulders"
    ],
    "defaultWeightMode": "total",
    "defaultRestSec": 60,
    "equipment": "bodyweight",
    "standard1RMBenchmarkKg": {
      "bronze": 8,
      "silver": 16,
      "gold": 28,
      "platinum": 42,
      "diamond": 58
    },
    "tips": [
      "Allinea spalla, anca e caviglia in un'unica linea retta contraendo gli obliqui."
    ],
    "commonMistakes": [
      "Far cadere il bacino verso il pavimento durante la tenuta."
    ]
  }
];
