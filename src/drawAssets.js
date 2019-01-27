'use strict';
// セレクト画面を作るエディタみたいなもの
let images = {};
let canvas;

function preload(){
  let names = ['select', 'message', 'easy', 'normal', 'hard'];
  names.forEach(function(name){
    images[name] = loadImage('./assets/' + name + '.png');
  })
}
function setup(){
  canvas = createCanvas(360, 480);
  noLoop();
}
function draw(){
  image(images['select'], 0, 0);
  image(images['message'], 40, 65);
  image(images['easy'], 110, 130);
  image(images['normal'], 110, 190);
  image(images['hard'], 110, 250);
}

function keyPressed(e){
  if(e.keyCode === 13){ saveCanvas(canvas, 'selectDisplay', 'png'); }
}
