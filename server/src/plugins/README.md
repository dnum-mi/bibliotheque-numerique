## Biblio-num Plugins

### Plugins DIR
```bash
-bin # Patch for plugin
-index.ts # Import your plugin in this file
-README.md

# Structure one Plugin
-myPlugin
--db
---migration
--entities
--module1
--module2
```

### Generating a new plugin dir
```bash
$ npm run plugin:init

> biblio-num-server@1.0.0 plugin:init
> cd src/plugins/ && sh bin/init

Enter the plugin name:
myPlugin
myPlugin plugin is created
```
OU
```bash
$ cd src/plugins && sh bin/init

Enter the plugin name:
myPlugin
myPlugin plugin is created
```


### Copy migration file of plugin
```bash
$ npm run plugin:setup

> biblio-num-server@1.0.0 plugin:setup
> cd src/plugins/ && sh bin/setup

Enter the plugin name:
myPlugin
<myPlugin> plugin migrations file is copied
```
OU
```bash
$ cd src/plugins && sh bin/setup

Enter the plugin name:
myPlugin
<myPlugin> plugin migrations file is copied
```