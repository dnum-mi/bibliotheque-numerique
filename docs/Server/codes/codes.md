
# À propos
Ce document détaille le mécanisme conçu pour identifier et récupérer des données spécifiques dans les champs de Démarche Simplifiée (DS), permettant ainsi de déclencher des comportements spécifiques au sein de la Bibliothèque Numérique.

# Fonctionnement
## Présentation simplifiée
Dans le contexte de Démarche Simplifiée, chaque champ est représenté par un objet nommé ChampDescriptor. Chaque ChampDescriptor inclut une description. Nous sollicitons nos utilisateurs professionnels, les clients finaux de l'application, pour intégrer des codes spécifiques dans les descriptions de certains champs. Ces codes sont par la suite utilisés dans le code source pour activer des fonctionnalités particulières. Une capture d'écran nommée ds-champ-descriptor.png illustre l'interface d'édition d'un champ de Démarche Simplifiée, mettant en évidence l'utilisation d'un code dans le champ de description.

```Note: Le code est inséré sous forme de commentaire HTML, le rendant ainsi invisible aux utilisateurs finaux de DS.```

## Bibliothèque Numérique
La synchronisation d'un dossier implique plusieurs opérations cruciales liées à l'usage de ces codes :

ds-api-client récupère les champs et les ChampDescriptor d'un dossier, puis réalise un mapping basé sur les identifiants des champs pour associer chaque ChampDescriptor à son champ correspondant.
Lorsque Biblionum traite un dossier, elle dispose ainsi d'une liste de champs accompagnée de leurs descriptions.
Biblionum examine ensuite les descriptions des ChampDescriptor du dossier ainsi que ceux actuellement utilisés dans la démarche.
:warning: Attention: Les codes insérés dans les descriptions peuvent varier selon la version de la démarche. C'est pourquoi ils sont vérifiés à deux endroits différents : dans le ChampDescriptor d'origine et dans la version la plus récente.

## Codes
Les différents codes sont répertoriés dans le système backend de Biblionum, spécifiquement dans le fichier **field-code.ts.** Un fichier Excel joint à ce document récapitule la liste initiale des codes utilisés pour la Bibliothèque Numérique, en lien avec les démarches de DS. Ces codes sont ensuite associés à l'entité Field au sein de Biblionum. Certains codes déclenchent des actions spécifiques, comme l'identification de fichiers joints qui sont reconnus et classifiés pour être associés à la fiche d'un organisme dans la Bibliothèque Numérique.
