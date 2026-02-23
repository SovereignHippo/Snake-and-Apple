import { Start } from './scenes/Start.js';
import {Game} from './scenes/Game.js';
import {GameOver} from './scenes/GameOver.js';
import {StartMenu} from './scenes/StartMenu.js';


const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Start,
        Game,
        GameOver,
        StartMenu,
        
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    
}

new Phaser.Game(config);
            