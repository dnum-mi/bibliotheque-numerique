# À propos de la synchronisation sur Biblionum

Ce document décrit le mécanisme de synchronisation au sein de la Bibliothèque Numérique.

# Généralités

La Bibliothèque Numérique ne possède pas de mécanisme d'écriture propre. Hormis quelques fonctionnalités très spécifiques, l'ensemble des données avec lesquelles elle travaille provient de sources externes. La Bibliothèque a pour but de ranger, de classer, de lire, et de paginer, mais **pas** d'écrire. C'est pourquoi, le mécanisme de synchronisation avec les sources externes représente un très gros chapitre du code et nécessite sa propre documentation.

Il existe trois sources de données principales (à date de la version 2.11.x) :
- **RNA** : permet d'ajouter des données des organismes associatifs.
- **RNF** : permet d'ajouter des données des organismes de fondation.
- **DS ou Démarche Simplifiée** : permet d'ajouter les données de démarches et des dossiers associés.

## RNA & RNF

Les fichiers et les informations principales des organismes proviennent du RNA et du RNF. Le RNF est présent dans ce dépôt et a été développé par la même équipe qui a développé la Bibliothèque Numérique. Le RNA est une API externe qui nous retourne des informations sur les associations à partir d'un numéro RNA ainsi que des fichiers. Dans un futur proche, une nouvelle version du RNA sera développée et permettra de relier ces deux API.

## Démarche Simplifiée

**90%** des données de la Bibliothèque Numérique proviennent de Démarche Simplifiée. DS est une API GraphQL, et non RESTful. La structure des données des démarches et des dossiers est dynamique et modifiable par ses utilisateurs, ce qui rend impossible pour BN de connaître la structure d'une démarche particulière à l'avance.

Pour pallier à ce problème, plusieurs solutions ont été développées :

### Ds-api-client

Cette librairie NPM a pour but de communiquer en GraphQL avec DS et d'exposer des fonctions toutes faites en API pour BN. Comme nous faisons souvent les mêmes opérations et cherchons à récupérer l'ensemble des données d'une démarche et d'un dossier, nous avons développé des fonctions dans ds-api-client appelant DS en demandant tous les champs existants dans les queries. De plus, afin de pouvoir associer à chaque ChampDescriptor d'une démarche le champ correspondant du dossier, la fonction récupérant les dossiers s'occupe de faire ce mapping afin que les données soient directement utilisables par BN.

### Synchronisation en queue

La synchronisation étant une grosse partie de l'application, elle peut potentiellement être très lourde. C'est pourquoi l'ensemble des tâches de synchronisation, que ce soit un fichier, un dossier ou une démarche, ont été découpées en jobs uniques qui sont ajoutés aux files d'attente de l'application. Un mécanisme anti-doublons sur une certaine période a aussi été développé afin d'empêcher la répétition de tâches et d'améliorer les performances.

Les jobs de synchronisation sont présents dans l'application `worker-sync`. Ceux spécifiquement pour les fichiers sont présents dans `worker-file`. Nous avons séparé en deux workers, car l'upload et le download de fichiers sont des tâches lourdes. Il y a énormément de fichiers, nous avons donc mis ce travail dans une file d'attente à part.

### Fields

Afin de pouvoir paginer de manière complexe plusieurs centaines de dossiers, nous avons créé une structure SQL permettant d'associer des `Fields` à un dossier. Pour chaque champ d'une démarche, on possède un `Field` avec un type. Et pour chaque champ du dossier, le `Field` correspondant nous permet de savoir son type.

### Code

En plus de pouvoir paginer de manière complexe, nous avons besoin de pouvoir déclencher des actions spécifiques en fonction de certains champs. Pour cela, nous avons créé un système de codes. La documentation spécifique à ce système est disponible dans le dossier `code`.
