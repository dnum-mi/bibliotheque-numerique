# Bibliothèque contenant du code partagé entre le back et le front

Cette bibliothèque a pour but de contenir du code partagé entre le back et le front

## Pourquoi

Cela permet d’éviter les doublons de code et la difficulté de maintenance de code dupliqué.

## Pourquoi ne pas avoir utilisé `@biblio-num/shared`

La bibliothèque `@biblio-num/shared` a dans ses dépendances des bibliothèques comme `@nestjs/swagger` et `class-validator` qui pose problème lorsqu’elles sont importées dans une application front. Elles ne posent pas de problèmes tant qu’on ne fait qu’importer des types TS dans le front, et en pose lorsqu’on importe du code.

⚠️ Il faut donc faire attention à ne pas ajouter dans les dépendances de ce workspace de telles bibliothèques !
