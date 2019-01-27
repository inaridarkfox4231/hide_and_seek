'use strict';
let images = {};
// p5.playの中にKEY['ENTER']とかあってkeyCodeでアクセスできるよ
let bits = {enter: 1, up: 2, down: 4, right: 8, left:16, space:32};
let moveState = {stop:0, moving:1, nextmove:2};
let keyFlag = 0;
let squareGroup;

// かくれんぼゲーム
let state; // 状態を表すクラス
let flag; // タッチ操作などの検出に使うフラグのクラスを入れる箱
let i, j, k;

// actSequence使って大幅に書き直し

function preload(){
  let imageNames = ['title', 'select', 'play', 'treasure'];
  imageNames.forEach(function(name){
    images[name] = loadImage("./assets/" + name + ".png");
  })
  for(i = 0; i < 3; i++){
    images['square_' + i] = loadImage("./assets/square_" + i + ".png");
  }
}

function setup(){
  createCanvas(360, 480);
  setState('title');
  flag = new touchFlag(); // フラグクラスのインスタンスを生成
  squareGroup = new Group();
  noFill();
}

function draw(){
  // 面倒だからなんか背景作ってここに書けばいい、共通のものはここでいいよね。
  state.update(); // stateにやらせる！
}


class titleState{
  constructor(){
    this.backgroundImage = images['title'];
  }
  update(){
    image(this.backgroundImage, 0, 0);
    if(flag.isHere() || getKey('enter')){ this.change(); flag.reset(); keyReset(); }
  }
  change(){
    setState('select');
  }
}

class selectState{
  constructor(){
    this.backgroundImage = images['select'];
    this.choice = 0; // 選択肢を管理する変数.
    this.squareTeam = new squares();
    this.squareTeam.setSquares('easy');
    this.dif = {0:'easy', 1:'normal', 2:'hard'}; // choice→difficultyの翻訳
  }
  update(){
    image(this.backgroundImage, 0, 0);
    fill(255);
    this.checkChoice(); // ここで受け付ける感じ
    this.drawCursor();
    // 正方形出す感じ
    drawSprites();
  }
  drawCursor(){ triangle(85, 140 + 60 * this.choice, 85, 162 + 60 * this.choice, 105, 150 + 60 * this.choice); }
  downCursor(){ this.choice = (this.choice + 1) % 3; }
  upCursor(){ this.choice = (this.choice + 2) % 3; }
  checkChoice(){
    if(flag.value === 0 && !keyFlag){ return; }
    if(flag.isHere() || getKey('enter')){ setState('play'); }
    else{
      if(flag.isDown() || getKey('down')){ this.downCursor(); }
      else if(flag.isUp() || getKey('up')){ this.upCursor(); }
      // 正方形を再生成
      this.squareTeam.setSquares(this.dif[this.choice]);
    }
    flag.reset(); keyReset();
  }
}

class playState{
  constructor(){
    this.playImage = images['play'];
    // どれかのsquareにお宝を持たせる
    this.answerNum = Math.floor(random(squareGroup.size()));
    squareGroup[this.answerNum].haveTreasure = true;
  }
  update(){
    image(this.playImage, 0, 0);
    drawSprites();
  }
}

function createSquare(typeColor, x, y){
  let square = createSprite(x, y, 40, 40);
  square.addImage(images['square_' + typeColor]);
  square.rotation = 0;
  square.haveTreasure = false; // お宝を持っているかどうか
  square.update = function(){
    this.rotation += 1;
  }
  square.addToGroup(squareGroup);
}

function createTreasure(){
  let treasure = createSprite(180, 280, 40, 40);
  treasure.addImage(images['treasure']);
  return treasure;
}

class squares{
  constructor(){
    this.setNum = {easy:3, normal:4, hard:5};
    this.color = {easy:0, normal:1, hard:2};
    this.setPos = {easy:[100, 180, 260], normal:[75, 145, 215, 285], hard:[60, 120, 180, 240, 300]};
  }
  setSquares(difficulty){
    squareGroup.removeSprites();
    for(i = 0; i < this.setNum[difficulty]; i++){
      createSquare(this.color[difficulty], this.setPos[difficulty][i], 350);
    }
  }
}

// 状態遷移を行う関数（if～elseはここに集中させる）
function setState(stateName){
  if(stateName === 'title'){ state = new titleState(); }
  else if(stateName === 'select'){ state = new selectState(); }
  else if(stateName === 'play'){ state = new playState(); }
}

// タッチ/クリックイベントの状態を管理する汎用クラス
class touchFlag{
  constructor(){
    this.value = 0; // 今までの「flag」にあたる
    this.start;
  }
  eventStart(){
    this.start = createVector(mouseX, mouseY);
  }
  setValue(){
    let released = createVector(mouseX, mouseY);
    let dist = released.sub(this.start);
    if(abs(dist.x) <= 5 && abs(dist.y) <= 5){ this.value |= 1; }
    else{
      if(dist.y > 5){ this.value |= 16; }else{ this.value |= 8; }
      if(dist.x > 5){ this.value |= 4; }else{ this.value |= 2; }
    }
  }
  isHere(){ return this.value & 1; }
  isDown(){ return this.value & 16; }
  isUp(){ return this.value & 8; }
  isRight(){ return this.value & 4; }
  isLeft(){ return this.value & 2; }
  reset(){
    this.value = 0;
  }
}

// フラグ処理用のコード
function touchStarted(){
  flag.eventStart();
  return false; // prevent default
}

function touchEnded(){
  flag.setValue();
  return false; // prevent default
}

// keyの取得
function getKey(codeName){
  return keyFlag & bits[codeName];
}

// keuFlagの設定
function keyTyped(){
  if(keyCode === KEY['ENTER']){ keyFlag |= 1; }
  if(keyCode === KEY['UP']){ keyFlag |= 2; }
  if(keyCode === KEY['DOWN']){ keyFlag |= 4; }
}
// keyFlagのリセット
function keyReset(){
  keyFlag = 0;
}

// もっと包括的なシークエンスの枠組みが必要
// 予め出現するスプライトを全部用意しておいて、
// それぞれに移動のシナリオを組んで配列に落として、
// あとはmoveSequenceと同じ要領で次から次へと実行させる。
