import type { DocPage } from "./docs";
import chartSource from "./examples/chart?raw";
import counterSource from "./examples/counter?raw";

export const frenchPages: DocPage[] = [
  {
    slug: "introduction",
    title: "Un état qui parle Solid.",
    group: "Start here",
    description:
      "Des événements typés. Des transitions explicites. Une réactivité fine. Solux apporte un flux d’événements de style Flux à votre application SolidJS.",
    sections: [
      {
        id: "the-event-flow",
        title: "Un flux d’événements simple et explicite",
        paragraphs: [
          "Créez un événement, décrivez comment une slice le traite, puis envoyez-le à un store. Lisez l’état directement dans le JSX de Solid ou calculez une valeur dérivée avec createMemo. Solux s’appuie sur les mécanismes de store de Solid : le suivi réactif se fait à chaque lecture de propriété.",
          "Utilisez Solux lorsqu’un tableau de bord, un éditeur ou une application a besoin d’événements nommés et de transitions d’état partagées. Pour l’état local de l’interface, les signaux et les stores de Solid peuvent suffire.",
        ],
        demo: "counter",
      },
      {
        id: "the-shape-of-a-store",
        title: "De l’événement à l’état",
        code: { label: "counter.ts · l’exemple fil rouge", value: counterSource },
        paragraphs: [
          "Les handlers mettent l’état à jour de façon synchrone, avec une syntaxe de mutation, grâce à produce de Solid. Les abonnements reçoivent l’état et l’événement après l’exécution du handler, y compris pour les événements qui ne modifient pas l’état.",
        ],
        links: [
          { label: "Créer votre premier store", href: "/docs/getting-started" },
          { label: "Comprendre l’état réactif", href: "/docs/reactive-state" },
        ],
      },
      {
        id: "about-these-docs",
        title: "Tenir compte de la version",
        note: "Cette documentation suit le dépôt actuel, y compris la libération explicite des stores et les corrections DevTools qui ne sont pas encore publiées. La version publiée du paquet est la 4.0.1. Une installation depuis le registre n’inclut pas automatiquement les changements non publiés.",
        paragraphs: [
          "Les exemples interactifs utilisent le paquet public @carere/solux de cet espace de travail. Les pages sur le cycle de vie et les DevTools distinguent les nouvelles garanties du comportement de la version 4.0.1 publiée.",
        ],
        links: [
          { label: "Notes de version et de migration", href: "/docs/migration" },
          { label: "Code source sur GitHub", href: "https://github.com/carere/solux" },
        ],
      },
    ],
  },
  {
    slug: "getting-started",
    title: "Premiers pas",
    group: "Start here",
    description:
      "Installez Solux, créez un store et reliez-le à un composant Solid. Aucun provider n’est nécessaire pour accéder directement au store.",
    sections: [
      {
        id: "installation",
        title: "Installer dans un projet SolidJS",
        paragraphs: [
          "Partez d’une application SolidJS + TypeScript existante. SolidJS et RxJS sont déclarés dans peerDependencies ; le manifeste actuel de la bibliothèque indique solid-js ^1.9.9 et rxjs ^7.8.2. Ce site utilise SolidJS ^1.9.10. Une installation sans numéro de version sélectionne la version du registre, actuellement la 4.0.1.",
        ],
        code: {
          label: "Terminal",
          language: "bash",
          value:
            "bun add @carere/solux solid-js rxjs\n# Ou avec npm :\nnpm install @carere/solux solid-js rxjs",
        },
      },
      {
        id: "create-a-store",
        title: "Créer des événements et une slice",
        paragraphs: [
          "Effectuez la création dans une fonction de fabrique. Chaque store indépendant reçoit sa propre slice et de nouveaux objets d’état initial. Les créateurs d’événements peuvent être partagés, car ils ne détiennent pas l’état du store.",
        ],
        code: { label: "counter.ts", value: counterSource },
      },
      {
        id: "use-in-solid",
        title: "Lire l’état là où Solid le suit",
        code: {
          label: "Counter.tsx · API actuelle du dépôt",
          language: "tsx",
          value: `import { createMemo, onCleanup } from "solid-js";
import { createCounterStore, increment } from "./counter";

export function Counter() {
  const store = createCounterStore();
  const doubled = createMemo(() => store.state.counter.value * 2);
  // Non publié : le créateur est explicitement responsable de la libération.
  onCleanup(() => store.dispose());

  return <button onClick={() => store.dispatch(increment(1))}>
    {store.state.counter.value} (double : {doubled()})
  </button>;
}`,
        },
        paragraphs: [
          "Lisez state.counter.value dans le JSX ou dans un calcul réactif. Déstructurer une propriété primitive hors d’un contexte de suivi capture sa valeur actuelle et empêche les lectures réactives ultérieures. Gardez les instances de graphiques, les nœuds DOM et les fonctions de nettoyage en dehors de l’état.",
        ],
        demo: "counter",
      },
      {
        id: "next-steps",
        title: "Choisir la prochaine étape",
        links: [
          { label: "Comprendre les événements et les slices", href: "/docs/events-and-slices" },
          { label: "Utiliser un provider ou une valeur dérivée", href: "/docs/reactive-state" },
          {
            label: "Créer des stores indépendants en toute sécurité",
            href: "/docs/store-lifecycle",
          },
        ],
      },
    ],
  },
  {
    slug: "events-and-slices",
    title: "Événements et slices",
    group: "Core concepts",
    description:
      "Nommez ce qui s’est passé, typez les données de l’événement et traitez-le de façon synchrone dans les slices responsables de l’état.",
    sections: [
      {
        id: "event-creators",
        title: "Les événements décrivent ce qui s’est passé",
        paragraphs: [
          "Un événement est un objet dont le champ type est une chaîne de caractères. createEvent<P>(name) crée une fonction qui accepte un payload de type P. Sans paramètre de type pour le payload, appelez le créateur sans argument. Les créateurs exposent une chaîne .type et une méthode .match(event) qui vérifie le type de l’événement et renvoie un booléen ; match ne valide pas les données du payload et ne constitue pas un prédicat de type TypeScript.",
          "Le callback prepare, facultatif, prend un argument et doit renvoyer un objet contenant payload. Validez les données externes avant d’envoyer un événement : les créateurs d’événements n’effectuent aucune validation de schéma à l’exécution.",
        ],
        code: {
          label: "events.ts",
          value: `import { createEvent } from "@carere/solux";

const renamed = createEvent<string>("project/renamed");
const cleared = createEvent("project/cleared");
const event = renamed("Observatory");
// { type: "project/renamed", payload: "Observatory" }
console.log(renamed.type, renamed.match(event));
cleared();`,
        },
      },
      {
        id: "handlers",
        title: "Chaque slice définit ses transitions",
        paragraphs: [
          "createSlice({ initialState, handlers }) renvoie getInitialState() et handler(state, event). La méthode addHandler du builder associe un type d’événement à un handler typé. Modifiez l’état fourni de façon synchrone ; les objets de remplacement renvoyés ne sont pas utilisés. Enregistrer une seconde fois le même type d’événement remplace le handler précédent dans cette slice.",
          "La slice conserve l’objet d’état initial qui lui est fourni. getInitialState() n’est ni une fabrique ni une frontière d’isolation. Créez une nouvelle slice avec de nouveaux objets d’état imbriqués pour chaque store indépendant.",
        ],
        code: {
          label: "project.ts",
          value: `import { createEvent, createSlice } from "@carere/solux";

const renamed = createEvent<string>("project/renamed");
const project = createSlice({
  initialState: { name: "Untitled" },
  handlers: (builder) => builder.addHandler(renamed, (state, event) => {
    state.name = event.payload;
  }),
});`,
        },
      },
      {
        id: "combining-slices",
        title: "Composer selon la structure de l’état",
        paragraphs: [
          "combineSlices({ counter, project }) crée une slice racine avec les clés correspondantes. À chaque événement envoyé, chaque handler enfant reçoit sa propre partie de l’état : plusieurs slices peuvent donc réagir au même événement. Les handlers enfants s’exécutent dans l’ordre des clés de l’objet. createHandler<S>(builderCallback) est également exporté si vous avez besoin d’un handler sans l’enveloppe d’état initial d’une slice.",
        ],
        code: {
          label: "store.ts",
          value: `import { combineSlices, configureStore } from "@carere/solux";
// counter et project sont de nouvelles slices créées dans cette fabrique.
const store = configureStore({
  rootSlice: combineSlices({ counter, project }),
});
store.dispatch(renamed("Observatory"));
console.log(store.state.project.name);`,
        },
      },
    ],
  },
  {
    slug: "reactive-state",
    title: "État réactif et contexte",
    group: "Core concepts",
    description:
      "Utilisez directement le modèle de suivi de Solid. Calculez des valeurs dérivées avec des accesseurs et des mémos ; ajoutez un contexte pour transmettre un store dans l’arbre de composants lorsque c’est utile.",
    sections: [
      {
        id: "tracking",
        title: "Suivre la propriété lue",
        paragraphs: [
          "store.state est un proxy de store Solid. Les expressions JSX, createMemo et les effets suivent les lectures de propriétés réactives. Un accesseur sous forme de fonction permet de conserver une lecture future ; une valeur primitive copiée depuis le proxy ne le permet pas. Les mutations des handlers sont appliquées avec produce de Solid, sans remplacer tout l’arbre d’état à chaque événement.",
        ],
        code: {
          label: "État dérivé",
          language: "tsx",
          value: `const value = () => store.state.counter.value;
const doubled = createMemo(() => value() * 2);

// Simple instantané : cette valeur primitive ne suivra pas les changements ultérieurs.
const { value: snapshot } = store.state.counter;

return <p>{value()} / {doubled()}</p>;`,
        },
      },
      {
        id: "optional-provider",
        title: "Utiliser le contexte selon vos besoins",
        paragraphs: [
          "Le provider est facultatif. Les composants peuvent recevoir un store par une prop ou accéder, par fermeture, à un store dont le cycle de vie est géré. SoluxProvider transmet un store à ses descendants ; useSolux<State>() renvoie ce store, ou undefined en l’absence de provider. Indiquez le type de l’état à useSolux et traitez explicitement l’absence de provider.",
        ],
        code: {
          label: "App.tsx · API actuelle du dépôt",
          language: "tsx",
          value: `import { SoluxProvider, useSolux } from "@carere/solux";
import { onCleanup } from "solid-js";
import { createCounterStore, increment } from "./counter";

type State = ReturnType<typeof createCounterStore>["state"];
function CounterButton() {
  const store = useSolux<State>();
  if (!store) throw new Error("CounterButton nécessite SoluxProvider");
  return <button onClick={() => store.dispatch(increment(1))}>
    {store.state.counter.value}
  </button>;
}
export function App() {
  const store = createCounterStore();
  onCleanup(() => store.dispose()); // API explicite, non publiée.
  return <SoluxProvider store={store}><CounterButton /></SoluxProvider>;
}`,
        },
        note: "Démonter SoluxProvider ou libérer un propriétaire réactif Solid ne libère pas automatiquement le store. Le créateur du store doit enregistrer son propre nettoyage.",
      },
      {
        id: "subscriptions",
        title: "Observer les événements explicitement",
        paragraphs: [
          "subscribe(listener) reçoit { state, event } après l’envoi de l’événement. Un abonnement sur un store actif rediffuse immédiatement le dernier événement s’il existe ; un nouveau store n’a aucun événement initial à rediffuser. subscribeToEvent(creator, listener) filtre ce même flux par type : il ne rediffuse que si l’unique dernier événement du flux correspond au type demandé. Envoyer A, puis B, puis s’abonner à A ne rediffuse pas A. Les deux méthodes renvoient des abonnements RxJS : appelez .unsubscribe() lorsque vous avez terminé.",
          "L’état reçu par le callback est l’état réactif courant, pas un instantané historique. Copiez les données sérialisables si vous conservez un historique. Un événement sans rapport avec l’état observé peut notifier les abonnés même si aucun handler ne modifie l’état.",
        ],
        code: {
          label: "Observer et nettoyer",
          value: `const subscription = store.subscribe(({ state, event }) => {
  console.log(event.type, state.counter.value);
});
const increments = store.subscribeToEvent(increment, ({ event }) => {
  console.log(event.payload); // Type number inféré.
});
subscription.unsubscribe();
increments.unsubscribe();`,
        },
      },
    ],
  },
  {
    slug: "entity-adapter",
    title: "Adaptateur d’entités",
    group: "Core concepts",
    description:
      "Normalisez vos collections en une liste ordonnée d’identifiants et un dictionnaire d’entités, avec des fonctions utilitaires à utiliser dans les handlers de vos slices.",
    sections: [
      {
        id: "normalized-state",
        title: "Définir les identifiants et l’ordre",
        paragraphs: [
          "createEntityAdapter<T> exige à la fois selectId(entity): string et sortComparer(a, b): number. getInitialState() crée { ids: [], entities: {} } ; un objet facultatif permet d’ajouter des champs. Obtenez un nouvel état d’adaptateur pour chaque store. Les identifiants doivent être des chaînes uniques, y compris dans les données transmises à setAll.",
        ],
        code: {
          label: "tasks.ts",
          value: `import { configureStore, createEntityAdapter, createEvent, createSlice } from "@carere/solux";

type Task = { id: string; title: string };
const tasks = createEntityAdapter<Task>({
  selectId: (task) => task.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});
const taskAdded = createEvent<Task>("tasks/added");
const slice = createSlice({
  initialState: tasks.getInitialState({ loading: false }),
  handlers: (builder) => builder.addHandler(taskAdded, (state, { payload }) => {
    tasks.addOne(state, payload);
  }),
});
const store = configureStore({ rootSlice: slice });
store.dispatch(taskAdded({ id: "docs", title: "Read Solux docs" }));
const selectors = tasks.getSelectors();
console.log(selectors.selectAll(store.state));`,
        },
      },
      {
        id: "collection-operations",
        title: "Choisir la bonne opération",
        table: {
          headings: ["Opération", "Comportement"],
          rows: [
            [
              "addOne / addMany",
              "Insèrent de nouveaux identifiants. Les entités existantes sont conservées, sans fusion ni remplacement.",
            ],
            [
              "setOne / setMany",
              "Insèrent ou remplacent des entités entières par identifiant. Les autres entités sont conservées.",
            ],
            [
              "setAll",
              "Remplace toute la collection. Fournissez des identifiants uniques ; le tableau d’entrée est trié sur place.",
            ],
            [
              "removeOne / removeMany",
              "Suppriment des deux collections le ou les identifiants fournis sous forme de chaînes.",
            ],
            [
              "removeAll",
              "Vide les identifiants et les entités ; conserve les champs d’état supplémentaires.",
            ],
          ],
        },
        paragraphs: [
          "Les fonctions d’ajout et de remplacement recalculent l’ordre des identifiants avec sortComparer. Il n’existe pas de méthodes updateOne ou upsertOne ; utilisez setOne avec une entité complète pour la remplacer. Ces fonctions modifient l’état reçu : utilisez-les dans les handlers ou sur un état dont vous maîtrisez le cycle de vie.",
        ],
      },
      {
        id: "selectors",
        title: "Sélectionner dans un contexte réactif",
        paragraphs: [
          "getSelectors() fournit selectIds, selectEntities, selectAll, selectTotal et selectById. selectById renvoie undefined si l’identifiant est absent. Passez une fonction selectState à getSelectors pour cibler une collection imbriquée dans un état racine. Les sélecteurs sont des fonctions ordinaires, pas des calculs mémoïsés : appelez-les dans le JSX ou enveloppez le résultat dans createMemo si nécessaire.",
        ],
        code: {
          label: "Collection imbriquée · suite de tasks.ts",
          value: `import { combineSlices } from "@carere/solux";
import { createMemo } from "solid-js";

const nestedStore = configureStore({
  rootSlice: combineSlices({
    tasks: createSlice({
      initialState: tasks.getInitialState(),
      handlers: (builder) => builder.addHandler(taskAdded, (state, { payload }) => {
        tasks.addOne(state, payload);
      }),
    }),
  }),
});
type RootState = typeof nestedStore.state;
const rootSelectors = tasks.getSelectors<RootState, RootState["tasks"]>(
  (state) => state.tasks,
);
const all = createMemo(() => rootSelectors.selectAll(nestedStore.state));`,
        },
      },
    ],
  },
  {
    slug: "middleware-and-epics",
    title: "Middlewares et epics",
    group: "In practice",
    description:
      "Enveloppez dispatch avec des middlewares ou transformez un flux d’événements RxJS en nouveaux événements. Gérez explicitement l’annulation et les effets externes.",
    sections: [
      {
        id: "middleware",
        title: "Envelopper dispatch en connaissance de cause",
        paragraphs: [
          "applyMiddlewares(middlewares) est un enhancer. Un Middleware<S> reçoit { state, dispatch }, puis next, puis un événement. Appelez next(event) pour poursuivre le traitement. Dans l’implémentation actuelle, middlewareApi.dispatch est le dispatch transmis à cet enhancer, et non une référence au dispatch final enveloppé.",
          "Le tableau est réduit de gauche à droite : pour [a, b], b enveloppe a et s’exécute donc en premier à l’entrée. Les enhancers eux-mêmes sont appliqués dans l’ordre du tableau. Ne présumez pas que la composition des middlewares ou les envois récursifs suivent la sémantique de Redux.",
        ],
        code: {
          label: "Un middleware de journalisation",
          value: `import { applyMiddlewares, configureStore, type Middleware } from "@carere/solux";

type State = { value: number };
const logger: Middleware<State> = (api) => (next) => (event) => {
  console.log("before", event.type, api.state.value);
  next(event);
  console.log("after", api.state.value);
};
// rootSlice est une Slice<State> créée pour ce store.
const store = configureStore({
  rootSlice,
  enhancers: [applyMiddlewares([logger])],
});`,
        },
      },
      {
        id: "epics",
        title: "Transformer les flux d’événements avec RxJS",
        paragraphs: [
          "Un Epic<State, Container> reçoit un Observable d’événements, l’état courant typé en lecture seule et un conteneur facultatif. Il renvoie un Observable d’événements. combineEpics(...epics) fusionne leurs flux de sortie. epicMiddleware({ rootEpic, container? }) relie un epic racine à dispatch ; l’événement d’entrée atteint next avant que l’epic ne le voie.",
          "Les sorties d’un epic utilisent la fonction dispatch de son middleware. Elles sont transmises en aval et réinjectées dans son flux d’événements : filtrez soigneusement les entrées pour éviter une boucle de rétroaction. Le typage en lecture seule ne gèle pas l’état à l’exécution et ne produit pas un instantané détaché.",
        ],
        code: {
          label: "Une transformation simple d’événements",
          value: `import { applyMiddlewares, combineEpics, configureStore,
  createEvent, epicMiddleware, type Epic } from "@carere/solux";
import { filter, map } from "rxjs";

const requested = createEvent<number>("counter/requested");
const applied = createEvent<number>("counter/applied");
type State = { value: number };
const applyRequest: Epic<State> = (event$) => event$.pipe(
  filter((event): event is ReturnType<typeof requested> =>
    event.type === requested.type),
  map((event) => applied(event.payload)),
);
// rootSlice traite applied ; créez une nouvelle slice pour ce store.
const store = configureStore({
  rootSlice,
  enhancers: [applyMiddlewares([
    epicMiddleware({ rootEpic: combineEpics(applyRequest) }),
  ])],
});`,
        },
      },
      {
        id: "cancellation",
        title: "Maîtriser la durée de vie du travail asynchrone",
        note: "La libération du store ne désabonne pas la souscription racine d’epicMiddleware, ne termine pas son Subject d’événements, n’annule pas les minuteurs et n’interrompt pas les requêtes réseau. Les middlewares qui enveloppent le dispatch du cœur peuvent encore s’exécuter après sa libération.",
        paragraphs: [
          "Gérez explicitement l’annulation avec des contrôleurs d’annulation dont vous êtes responsable, des signaux RxJS takeUntil et le nettoyage des minuteurs. Appliquez takeUntil au flux de sortie racine pour terminer le travail observable dont vous êtes responsable et déclenchez ce signal au nettoyage du périmètre. Le middleware d’epics actuel n’expose pas d’API de libération distincte.",
          "Traitez les erreurs dans vos pipelines d’epics pour qu’une erreur non gérée n’interrompe pas le flux prévu. Restaurer l’état par voyage temporel n’annule pas les requêtes réseau, ne réexécute pas les epics de façon déterministe et ne restaure pas les ressources externes.",
        ],
        links: [
          { label: "Responsabilité et libération du store", href: "/docs/store-lifecycle" },
          { label: "Sémantique des DevTools", href: "/docs/devtools" },
        ],
      },
    ],
  },
  {
    slug: "store-lifecycle",
    title: "Périmètres et libération des stores",
    group: "In practice",
    description:
      "Rendez les responsabilités visibles : un nouvel état pour chaque périmètre indépendant et un chemin de nettoyage explicite lorsqu’il se termine.",
    sections: [
      {
        id: "fresh-state",
        title: "La fabrique délimite l’isolation",
        paragraphs: [
          "Pour des panneaux de graphiques, des éditeurs ou des requêtes SSR indépendants, créez les slices dans la fabrique du store et allouez-y chaque objet imbriqué de l’état initial. Réutiliser une slice peut réutiliser ses objets d’état initial. Un instantané DevTools détaché n’isole pas l’état courant.",
          "preloadedState remplace l’état initial racine ; il n’est pas fusionné avec lui. Fournissez une structure d’état complète et allouez-la ou copiez-la pour chaque périmètre, y compris les tableaux et objets imbriqués. Évitez les stores singletons au niveau du module dans les handlers SSR.",
        ],
        code: { label: "chart.ts · l’exemple fil rouge", value: chartSource },
        demo: "scopes",
      },
      {
        id: "dispose",
        title: "Libérer ce que vous créez",
        note: "Non publié : store.dispose() explicite et idempotent, fermeture des abonnements du cœur après libération et nettoyage DevTools par connexion sont des changements du dépôt postérieurs à la version 4.0.1 publiée.",
        paragraphs: [
          "dispose() ferme une seule fois les abonnements du store et libère les ressources enregistrées par les enhancers. Les envois ultérieurs au dispatch du cœur sont sans effet ; les nouveaux abonnements du cœur sont fermés sans rediffuser le dernier événement. L’état final reste lisible. Vous pouvez désabonner un écouteur individuel sans libérer le store.",
          "Le store public expose state, dispatch, subscribe, subscribeToEvent et dispose. onDispose, initialState et setState sont réservés aux enhancers et sont retirés du store public renvoyé. Les enhancers personnalisés doivent conserver les méthodes de cycle de vie lorsqu’ils renvoient un store.",
          "Le provider et le propriétaire réactif Solid ne prennent pas automatiquement en charge le nettoyage du store. Enregistrez vous-même store.dispose dans onCleanup lorsque le composant est responsable du store. Recréer un périmètre implique de créer un nouveau store, pas de réactiver un store libéré.",
        ],
        code: {
          label: "Un graphique dont le composant gère le cycle de vie",
          language: "tsx",
          value: `import { onCleanup } from "solid-js";
import { createChartStore, appendPoint } from "./chart";

function ChartPanel() {
  const store = createChartStore();
  const subscription = store.subscribe(({ event }) => console.log(event));
  // Gardez la référence au graphique réel en dehors de l’état sérialisable.
  onCleanup(() => {
    subscription.unsubscribe();
    store.dispose();
    // Libérez aussi l’instance du graphique et annulez le travail dont vous êtes responsable.
  });
  return <button onClick={() => store.dispatch(appendPoint(42))}>
    Points: {store.state.series.points.length}
  </button>;
}`,
        },
      },
      {
        id: "ssr",
        title: "Donner son propre store à chaque requête",
        paragraphs: [
          "Utilisez une fabrique propre à chaque requête et un bloc finally autour de l’opération de rendu. Pour le SSR en streaming, conservez le store jusqu’à la fin ou à l’interruption du flux, au lieu de le libérer dès la création du flux. Si vous hydratez un état préchargé dans le navigateur, transférez uniquement des données sérialisables et échappez-les de façon sûre avec les outils de sérialisation de votre framework.",
        ],
        code: {
          label: "Cycle de vie d’une requête sans streaming · intégration en pseudocode",
          value: `async function handleRequest() {
  const store = createChartStore();
  try {
    return await renderRequestWithStore(store);
  } finally {
    store.dispose(); // API non publiée ; aucune annulation automatique des epics.
  }
}`,
        },
        links: [
          {
            label: "Limites de l’annulation asynchrone",
            href: "/docs/middleware-and-epics#cancellation",
          },
        ],
      },
    ],
  },
  {
    slug: "devtools",
    title: "DevTools et voyage temporel",
    group: "In practice",
    description:
      "Inspectez les événements et restaurez l’état avec l’extension Redux DevTools. Considérez le voyage temporel comme une inspection de l’état dont les limites sont explicites.",
    sections: [
      {
        id: "connect",
        title: "Activer les DevTools pour chaque store",
        paragraphs: [
          "Ajoutez devtools(options) à la liste des enhancers. Le type DevToolsOptions de Solux exige instanceId ; choisissez un identifiant distinct pour chaque store actif et utilisez name pour donner un nom lisible à la connexion. L’implémentation actuelle fonctionne sans erreur en l’absence de window ou de l’extension du navigateur, y compris en SSR.",
        ],
        code: {
          label: "Connexion en développement",
          value: `import { configureStore, devtools } from "@carere/solux";

// rootSlice est propre à ce périmètre. Utilisez un instanceId distinct par store actif.
const store = configureStore({
  rootSlice,
  enhancers: [devtools({ instanceId: "chart-A", name: "Chart A" })],
});
// À la fin du périmètre responsable du store (non publié) :
store.dispose();`,
        },
      },
      {
        id: "commands",
        title: "Ce que font réellement les commandes",
        table: {
          headings: ["Commande", "Comportement actuel du dépôt"],
          rows: [
            ["ACTION", "Analyse le payload JSON et l’envoie comme événement."],
            [
              "JUMP_TO_STATE / JUMP_TO_ACTION",
              "Applique l’état sérialisé fourni via setState de Solid ; les handlers et les epics ne sont pas rejoués.",
            ],
            ["ROLLBACK", "Applique l’état sérialisé fourni par l’extension."],
            [
              "RESET",
              "Applique une nouvelle copie de l’état de référence initial ou préchargé capturé à la construction, puis initialise l’extension avec l’état courant.",
            ],
            [
              "COMMIT",
              "Initialise l’extension avec l’état courant. Ne modifie pas l’état de référence de RESET capturé à la construction.",
            ],
            [
              "IMPORT_STATE",
              "Utilise le dernier état calculé et envoie à l’extension une copie détachée de l’état enrichi de l’historique (lifted state). Un tableau computedStates vide est ignoré.",
            ],
            ["TOGGLE_ACTION / LOCK_CHANGES", "Non implémentées."],
          ],
        },
        paragraphs: [
          "La restauration de l’état suit la sémantique de mise à jour des objets de setState de Solid ; elle ne construit pas un nouveau store et ne garantit pas le remplacement de tout l’arbre. Conservez une structure d’état sérialisable stable. Les messages DevTools sont des entrées considérées comme fiables : cette intégration n’effectue pas de validation à l’exécution.",
        ],
      },
      {
        id: "unreleased-guarantees",
        title: "Nouvelles garanties au-delà de la 4.0.1",
        bullets: [
          "Fonctionnement sans erreur en SSR et sans extension : l’enhancer peut renvoyer le store sans établir de connexion.",
          "Instantanés initiaux, d’événements et importés détachés : les mutations ultérieures de l’état courant ne réécrivent pas les instantanés déjà envoyés aux DevTools.",
          "État de référence détaché capturé à la construction pour RESET, y compris preloadedState ; COMMIT ne remplace pas cet état de référence.",
          "Libération idempotente du store et nettoyage par connexion : libérer le graphique A n’appelle pas le disconnect global de l’extension et ne déconnecte pas le graphique B.",
          "Les callbacks reçus après la libération sont ignorés, y compris les messages tardifs pendant l’établissement de la connexion.",
        ],
        note: "Ces garanties du dépôt ne sont pas encore publiées. Le champ de version du paquet indique toujours 4.0.1 ; cela ne prouve pas que la version du registre contient ces corrections.",
      },
      {
        id: "effect-limits",
        title: "Restaurer l’état ne rejoue pas les effets",
        paragraphs: [
          "Restaurer l’état ne rejoue pas les événements d’origine dans les handlers, ne réexécute pas les effets de bord de façon déterministe, n’annule pas les epics, ne défait pas les requêtes et ne recrée pas les références aux graphiques. Un envoi via ACTION peut déclencher les effets habituels ; la restauration d’état via JUMP suit un chemin différent.",
          "Gardez les nœuds DOM, les instances de graphiques, les fonctions, les abonnements et les ressources à nettoyer en dehors de l’état sérialisable. Créez un nouvel état courant pour les stores indépendants ; le clonage par les DevTools ne suffit pas à isoler les stores.",
        ],
        links: [
          { label: "Fabriques de stores indépendants", href: "/docs/store-lifecycle" },
          { label: "Notes de migration", href: "/docs/migration" },
        ],
      },
    ],
  },
  {
    slug: "api-reference",
    title: "Référence de l’API",
    group: "Resources",
    description:
      "Les exports publics de @carere/solux, regroupés par fonction. Importez-les depuis le point d’entrée du paquet.",
    sections: [
      {
        id: "state-api",
        title: "Événements, handlers, slices et stores",
        table: {
          headings: ["Export", "Contrat"],
          rows: [
            [
              "createEvent<P>(name, prepare?)",
              "Crée des événements typés. Le callback prepare facultatif, à un seul argument, renvoie { payload }. Creator.type et .match inspectent les types d’événements.",
            ],
            [
              "createHandler<S>(builderCallback)",
              "Construit un Handler<S> synchrone avec addHandler(eventCreator, handler).",
            ],
            [
              "createSlice({ initialState, handlers })",
              "Renvoie { getInitialState, handler }. L’état initial est conservé ; getInitialState n’en alloue pas un nouveau.",
            ],
            [
              "combineSlices(map)",
              "Compose des slices associées à des clés en une slice racine ; les clés et types de l’état suivent l’objet fourni.",
            ],
            [
              "configureStore({ rootSlice, preloadedState?, enhancers? })",
              "Crée un store réactif. rootSlice est requis à l’exécution. preloadedState fournit l’état de départ complet.",
            ],
            [
              "store.state / store.dispatch(event)",
              "Lit l’état réactif ; traite un événement de façon synchrone, puis notifie les abonnés.",
            ],
            [
              "store.subscribe(listener)",
              "Observe { state, event } ; les abonnements sur un store actif rediffusent le dernier événement s’il existe. Renvoie une Subscription RxJS.",
            ],
            [
              "store.subscribeToEvent(creator, listener)",
              "Filtre ce même flux d’événements par type. Renvoie une Subscription RxJS.",
            ],
            [
              "store.dispose() · non publié",
              "Ferme de manière idempotente le flux d’événements du cœur et exécute les nettoyages enregistrés par les enhancers. Aucune annulation automatique des effets.",
            ],
          ],
        },
      },
      {
        id: "composition-api",
        title: "Contexte, enhancers et epics",
        table: {
          headings: ["Export", "Contrat"],
          rows: [
            [
              "SoluxProvider",
              "Transmet le store via le contexte de Solid ; ne prend pas en charge sa libération.",
            ],
            [
              "useSolux<S>()",
              "Renvoie Store<S> | undefined depuis le contexte. Le provider est facultatif pour accéder directement au store.",
            ],
            [
              "devtools<S>(options)",
              "Enhancer Redux DevTools à activer explicitement. options exige instanceId. Consultez la sémantique des commandes et les réserves concernant les versions publiées.",
            ],
            [
              "applyMiddlewares<S>(middlewares)",
              "Enveloppe dispatch par une réduction de gauche à droite : le dernier middleware est le plus externe.",
            ],
            [
              "epicMiddleware<S, C>({ rootEpic, container? })",
              "Relie un epic RxJS à dispatch. Aucune libération automatique lors de la libération du store.",
            ],
            [
              "combineEpics<S, C>(...epics)",
              "Fusionne les sorties des epics qui reçoivent le même flux d’événements, le même état et le même conteneur.",
            ],
            [
              "nanoid(size = 21)",
              "Génère un identifiant aléatoire non cryptographique. Ne convient pas aux secrets ni aux jetons de sécurité.",
            ],
          ],
        },
      },
      {
        id: "entity-api",
        title: "Fonctions utilitaires pour les entités",
        paragraphs: [
          "createEntityAdapter<T>({ selectId, sortComparer }) renvoie addOne, addMany, setOne, setMany, setAll, removeOne, removeMany, removeAll, getInitialState et getSelectors. EntityState<T> contient ids: string[] et entities: Record<string, T>. Les sélecteurs sont selectIds, selectEntities, selectAll, selectTotal et selectById.",
        ],
        links: [
          { label: "Détails et exemple de l’adaptateur d’entités", href: "/docs/entity-adapter" },
        ],
      },
      {
        id: "public-types",
        title: "Types publics",
        paragraphs: [
          "Événements et handlers : Event, EventWithPayload, Handler, Dispatch, BasicEventCreator, EventCreatorWithPayload, EventCreatorWithoutPayload, EventCreatorWithPreparedPayload, PayloadEventCreator, PrepareCallback et AnyEventCreator.",
          "État et composition : Store, StoreOption, Slice, SliceOption, SlicesMapObject, StateFromSlicesMapObject, EventHandlerMapBuilder, Middleware, MiddlewareApi, Enhancer, EnhancedStore, Epic et DevToolsOptions.",
          "Entités : EntityState, EntityAdapterOptions, EntityStateAdapter et EntitySelectors. IfUndefined et IfPrepareActionMethodNotProvided sont des utilitaires d’inférence exportés, marqués comme internes ; le code applicatif devrait généralement laisser les appels aux fabriques inférer ces détails.",
          "EnhancedStore ajoute initialState, setState et onDispose pour l’implémentation des enhancers. Ces fonctionnalités sont absentes du store public renvoyé. Conservez les autres méthodes du store lorsque vous implémentez des enhancers personnalisés.",
        ],
        links: [
          {
            label: "Consulter le point d’entrée public",
            href: "https://github.com/carere/solux/blob/main/packages/solux/src/index.ts",
          },
          {
            label: "Consulter les définitions de types",
            href: "https://github.com/carere/solux/blob/main/packages/solux/src/types.ts",
          },
        ],
      },
    ],
  },
  {
    slug: "migration",
    title: "Migration et état des versions",
    group: "Resources",
    description:
      "Distinguez l’API 4.0.1 publiée des changements de l’espace de travail qui ne sont pas encore publiés.",
    sections: [
      {
        id: "release-status",
        title: "Le code actuel devance la version publiée",
        note: "La version du registre est la 4.0.1. La libération des stores et les garanties de fonctionnement des DevTools décrites ici ne sont pas encore publiées. Le champ de version de l’espace de travail reste à 4.0.1 pendant le développement ; cela ne constitue pas une nouvelle version publiée.",
        paragraphs: [
          "Les usages existants des événements, slices, entités, contextes, middlewares et epics continuent d’utiliser l’import public @carere/solux. Le dépôt déplace la bibliothèque vers packages/solux et la documentation vers apps/website. Ce changement d’organisation ne renomme pas le paquet et n’exige pas d’imports depuis des chemins privés.",
        ],
      },
      {
        id: "adoption-checklist",
        title: "Adopter le nouveau cycle de vie en connaissance de cause",
        bullets: [
          "Lorsque vous utilisez une version qui inclut la libération, ajoutez un appel explicite à store.dispose() à la fin du périmètre responsable. Ne supposez pas que le démontage du provider s’en charge.",
          "Déplacez la construction des slices et toute allocation d’état initial ou préchargé imbriqué dans une fabrique pour les stores indépendants ou les requêtes SSR.",
          "Attribuez un instanceId distinct à chaque connexion DevTools. Gardez les références aux graphiques et les ressources à nettoyer en dehors de l’état.",
          "Continuez à désabonner les abonnements individuels et à annuler le travail asynchrone dont vous êtes responsable. La libération n’annule ni les epics ni les effets des middlewares.",
          "Si vous écrivez un enhancer personnalisé, conservez dispose et enregistrez le nettoyage avec le hook onDispose réservé aux enhancers. N’exposez pas les mécanismes internes des enhancers comme API applicatives.",
          "Vérifiez le comportement de RESET, COMMIT et du voyage temporel dans votre application. La restauration d’état ne garantit pas une réexécution déterministe des effets.",
        ],
        links: [
          {
            label: "Essayer les graphiques aux périmètres indépendants",
            href: "/docs/store-lifecycle#fresh-state",
          },
          { label: "Examiner le comportement des DevTools", href: "/docs/devtools" },
        ],
      },
      {
        id: "follow-releases",
        title: "Vérifier le paquet publié",
        paragraphs: [
          "Consultez les versions GitHub et le registre du paquet pour confirmer quelle version contient un changement avant de vous y fier. La documentation du code source et les exemples interactifs de l’espace de travail décrivent cette copie du dépôt, sans garantir le contenu d’une archive déjà publiée.",
        ],
        links: [
          {
            label: "Versions publiées sur GitHub",
            href: "https://github.com/carere/solux/releases",
          },
          { label: "Paquet sur npm", href: "https://www.npmjs.com/package/@carere/solux" },
        ],
      },
    ],
  },
  {
    slug: "contributing",
    title: "Contribuer",
    group: "Resources",
    description:
      "Aidez à améliorer la bibliothèque, les exemples et la documentation. Partez d’un comportement concret et de l’interface de l’API publique.",
    sections: [
      {
        id: "workspace",
        title: "Travailler dans l’espace Bun + Moon",
        paragraphs: [
          "packages/solux contient la bibliothèque publique et ses tests de paquet ; apps/website contient ce site de documentation Solid. Les outils partagés se trouvent à la racine. Lisez AGENTS.md, CODING_STANDARD.md et le guide de l’espace de travail avant de choisir les commandes. Les manifestes et la configuration Moon versionnés font autorité.",
          "Les tâches de compilation et de développement du site dépendent de la compilation de la bibliothèque. La suite de tests navigateur utilise l’aperçu Vite de production. Le déploiement du site est une tâche distincte, déclenchée manuellement ; compiler ou tester ne publie jamais le site.",
        ],
        code: {
          label: "Depuis la racine du dépôt · après l’installation des dépendances",
          language: "bash",
          value:
            "bun moon run solux:build\nbun moon run website:dev\nbun moon run website:typecheck\nbun moon run website:build\nbun moon run website:test-browser",
        },
        links: [
          { label: "Dépôt", href: "https://github.com/carere/solux" },
          {
            label: "Règles de développement",
            href: "https://github.com/carere/solux/blob/main/CODING_STANDARD.md",
          },
          {
            label: "Guide de l’espace de travail",
            href: "https://github.com/carere/solux/blob/main/docs/agents/workspace.md",
          },
        ],
      },
      {
        id: "reporting",
        title: "Rendre un comportement reproductible",
        paragraphs: [
          "Pour signaler un bug, indiquez la version du paquet, un exemple minimal de reproduction, la transition attendue et ce qui s’est réellement passé. Pour les bugs de cycle de vie ou de DevTools, précisez comment le store a été créé et nettoyé, si plusieurs stores étaient ouverts et si l’extension était installée.",
          "Préservez l’utilisation des imports publics, l’inférence de types et les déclarations du paquet distribué. Ajoutez des tests ciblés de la bibliothèque pour les changements de comportement et une couverture navigateur pour les exemples de documentation. Le dépôt est sous licence MIT.",
        ],
        links: [
          {
            label: "Signalements et demandes de fonctionnalités",
            href: "https://github.com/carere/solux/issues",
          },
          { label: "Licence", href: "https://github.com/carere/solux/blob/main/LICENSE" },
        ],
      },
    ],
  },
];
