ninjaBuildGen = require('ninja-build-gen');
ninja = ninjaBuildGen('1.3', 'build');


ninja.rule('build-project').run('cd $in && yarn run build && copy /y $out')
     .description("Building '$in' to '$out'.");
ninja.rule('copy').run('cp $in $out')
     .description("Copy file '$in' to '$out'");
ninja.rule('electron-build').run('electron-rebuild $in $out')
     .description("Copy file '$in' to '$out'");



ninja.edge('gamebryo-plugin-management').from('extensions/gamebryo-plugin-management').using('build-project');
ninja.edge('gamebryo-plugin-indexlock').from('extensions/gamebryo-plugin-indexlock').using('build-project');
ninja.edge('build').from(['gamebryo-plugin-management', 'gamebryo-plugin-indexlock']);
ninja.byDefault('build');



ninja.save('build.ninja');
