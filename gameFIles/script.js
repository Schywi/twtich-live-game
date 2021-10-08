 const positionsDB = {
    a1: {
        x: 3,
        y: 103
    }, 
    a2: {
        x: 3,
        y: 203
    }, 
    a3: {
        x: 3,
        y: 303
    }, 
    a4: {
        x: 3,
        y: 403
    }, 
    a5: {
        x: 3,
        y: 503
    }, 
    b1: {
        x: 103,
        y: 103
    }, 
    b2: {
        x: 103,
        y: 203
    }, 
    b3: {
        x: 103,
        y: 303
    }, 
    b4: {
        x: 103,
        y: 403
    }, 
    b5: {
        x: 103,
        y: 503
    }, 
    c1: {
        x: 203,
        y: 103
    }, 
    c2: {
        x: 203,
        y: 203
    }, 
    c3: {
        x: 203,
        y: 303
    }, 
    c4: {
        x: 203,
        y: 403
    }, 
    c5: {
        x: 203,
        y: 503
    }, 
    d1: {
        x: 303,
        y: 103
    }, 
    d2: {
        x: 303,
        y: 203
    }, 
    d3: {
        x: 303,
        y: 303
    }, 
    d4: {
        x: 303,
        y: 403
    }, 
    d5: {
        x: 303,
        y: 503
    }, 
    e1: {
        x: 403,
        y: 103
    }, 
    e2: {
        x: 403,
        y: 203
    }, 
    e3: {
        x: 403,
        y: 303
    }, 
    e4: {
        x: 403,
        y: 403
    }, 
    e5: {
        x: 403,
        y: 503
    }, 
    f1: {
        x: 503,
        y: 103
    }, 
    f2: {
        x: 503,
        y: 203
    }, 
    f3: {
        x: 503,
        y: 303
    }, 
    f4: {
        x: 503,
        y: 403
    }, 
    f5: {
        x: 503,
        y: 503
    }, 
    
    



}

function hideMenu() {
    const game =   document.getElementById("gameCommands");
    game.classList.remove("show");
    game.classList.add("hide");
    

    }

    function showMenu() {
        const game =   document.getElementById("gameCommands");
        game.classList.remove("hide");
        game.classList.add("show");
    
       }


const socket = new WebSocket("ws://127.0.0.1:8080/ws");
 
socket.onopen = (e) => {
      console.log("Client connected")
      
   };

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variables
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 500;
let enemiesInterval = 200;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
// use to choose between defenders
let chosenDefender = 1;
let chosenUserName = "Player 1#"

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
}

// listen to mouse enterand down
canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
})

canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
})

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.y = undefined;
    mouse.y = undefined;
});

// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'gold';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw()
         
    }
}
const bullet = new Image();
bullet.src = "bullet.png"
// projectiles
class Projectile {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.power = 25;
        this.speed = 5;
        this.frameX = 0;
        this.frameY = 0; 
        this.spriteWidth = 64;
        this.spriteHeight = 64;
        this.minFrame = 0;
        this.maxFrame = 6; 
    }
    draw(){
        ctx.drawImage(bullet, this.frameX * this.spriteWidth, 0, this.spriteWidth, 
        this.spriteHeight, this.x, this.y, this.width, this.height)
   
       // ctx.fillStyle = 'black';
        ctx.beginPath();
       //ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
       // ctx.fill();
       
    }
    update(){
        this.x += this.speed;
        if(frame % 10 === 0){
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
             
        }
       
    }
   
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++){
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}

const defender2 = new Image();
defender2.src = "defender2.png"
const defender1 = new Image();
defender1.src = "defender1.png"

// defenders
class Defender {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0; 
        this.spriteWidth = 194;
        this.spriteHeight = 194;
        this.minFrame = 0;
        this.maxFrame = 16;  
        this.chosenDefender = chosenDefender;
        this.chosenUserName = chosenUserName;
    }
    draw(){
        // don't do things with code that is more easy with grapuhic editors
       // ctx.fillStyle = 'blue';
       // ctx.fillRect(this.x, this.y, this.width, this.height);
       // Health text : Math.floor(this.health)
        ctx.fillStyle = 'aqua';
        ctx.font = '15px Orbitron';
        ctx.fillText(this.chosenUserName, this.x + 10, this.y + 10);
        if(this.chosenDefender === 1) {
             // drop image on position
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, 
                this.spriteHeight, this.x, this.y, this.width, this.height)
       
        } else if (this.chosenDefender === 2){
              // drop image on position
              ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, 
                this.spriteHeight, this.x, this.y, this.width, this.height)
       
        }
       
      }
    update(){
        if(frame % 10 === 0){
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if (this.frameX === 15) this.shootNow = true
        }

        if(this.chosenDefender === 1 ){
             // change animation if there is no enemy , 
                // changing min and max frame will show diferrent animations
                if(this.shooting) {
                    this.minFrame = 0;
                    this.maxFrame = 16;
                }else {
                    this.minFrame = 17; 
                    this.maxFrame = 24; 
                }
        } else if (this.chosenDefender === 2){
                if(this.shooting) {
                    this.minFrame = 13;
                    this.maxFrame = 28;
                }else {
                    this.minFrame = 0; 
                    this.maxFrame = 12; 
                }
        }
      

        // if enemy is on the same row and image frame for atatck then attack
        if (this.shooting && this.shootNow){
            if (this.timer % 100 === 0){
                projectiles.push(new Projectile(this.x + 70, this.y + 5));
                this.shootNow = false;
            }
        }  
    }
}

const card1 = {
x: 10, 
y: 10, 
width: 70, 
height: 85
}

const card2 = {
    x: 90, 
    y: 90, 
    width: 70, 
    height: 85
}

function chooseDefender(){
    let card1stroke = 'black';
    let card2stroke = 'black';

    if(collision(mouse,card1)){
        chosenDefender = 1;
     } else if (collision(mouse,card2)){
         chosenDefender = 2;
     }

     if(chosenDefender === 1){
         card1stroke = 'gold';
         card2stroke = 'black';
     } else if (chosenDefender ===2 ){
        card1stroke = 'black';
        card2stroke = 'gold';
     } else {

     }



    ctx.lineWidth = 1; 
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height)
    ctx.drawImage(defender1,0,0,194,194,0,5,194/2,194/2)
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height)
   
    ctx.fillRect(card2.x, card1.y, card1.width, card1.height)
    ctx.drawImage(defender2,0,0,194,194,80,5,194/2,194/2)
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card1.y, card1.width, card1.height)
    
}


 



 
       
socket.onmessage = (e) => { 
    console.log("dataFromWebsocket", e.data, e , e.data==='"a1"' )
   
    const data = JSON.parse(e.data);
    const value = data.message
    if(value === "menu"){
        showMenu()
    }
    if(value ==="closeMenu"){
        hideMenu()
    }
    const userName = data.user
   if(userName !== ""){
       chosenUserName = userName
   }
    if(positionsDB[value] !== undefined){
        
            const gridPositionX = positionsDB[value].x;
            const gridPositionY = positionsDB[value].y;
            console.log("gridPoisiton X y",gridPositionX , gridPositionY )
            if (gridPositionY < cellSize) return;
            for (let i = 0; i < defenders.length; i++){
                if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
            }
            let defenderCost = 100;
            if (numberOfResources >= defenderCost){
                defenders.push(new Defender(gridPositionX, gridPositionY));
                numberOfResources -= defenderCost;
            }
    
    }
    if(value === "Blue"){
        chosenDefender = 1
    }

    if(value === "Pink") {
        chosenDefender = 2
    }

 
    if(value !== undefined){
   // check coins
        const checkCoinsString = value.includes("get")
        if(checkCoinsString){
            var ret = value.replace('get','');
           console.log("CoinAMount", ret)
    
            handleCoins(Number(ret))
        }
    }
    
}; 

function handleCoins(coinValue){
    if (frame % 500 === 0 && score < winningScore){
        resources.push(new Resource());
    }

    
    // handle with creation of resorces
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
       // resources[i].update();
         
        const resourceIndex = resources.findIndex(money =>  money.amount === coinValue)
        console.log("CoinsIndex", resourceIndex)
        if(resourceIndex !== -1){
             // add float message to resources
             floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x , resources[i].y, 30, 'gold'
             ));
             floatingMessages.push(new floatingMessage('+' + resources[i].amount, 470, 85, 30, 'gold'));
 
            numberOfResources += resources[resourceIndex].amount
            resources.splice(resourceIndex, 1);
             i--;
        }
       
         
        
    }
}
   
   
   
   function handleBackground () {
            const background = new Image();
            background.src = "theme2.jpg";
            
            ctx.lineWidth = 1; 
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.drawImage(background,0,0);   

           
   }







function handleDefenders(){
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1){
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++){
            if (defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 0.25;
            }
            if (defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
                console.log("Enemies Speed", enemies[j].movement)
            }
        }
    }
}

const floatingMessages = []
class floatingMessage {
    constructor(value, x , y, size , color){
        this.value = value;
        this.x = x ; 
        this.y = y; 
        this.size = size; 
        this.lifeSpan = 0 ; 
        this.color = color; 
        this.opacity =1;
    }

    update(){
        this.y -= 0.3; 
        this.lifeSpan += 1;
        if(this.opacity > 0.03) this.opacity -= 0.03;
    }
    draw(){
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Orbitron'; 
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x  - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    console.log("gridPoisiton X y",gridPositionX , gridPositionY )
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++){
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost){
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else{
        floatingMessages.push(new floatingMessage("need more resources", mouse.x 
        , mouse.y, 15, 'blue'));
    }
});

function handleFloatingMessages(){
    for(let i = 0; i< floatingMessages.length; i++){
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if(floatingMessages[i].lifeSpan >= 50){
            floatingMessages.splice(i,1);
            i--;
        }
    }
}


// handle enemi images
const enemyTypes = []
const enemy1 = new Image(); 
enemy1.src = "enemy1.png"; 
enemyTypes.push(enemy1)
const enemy2 = new Image();
enemy2.src = "enemy2.png"; 
enemyTypes.push(enemy2)

// enemies
class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.12;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]; 
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        if(this.enemyType === enemy1){
            this.maxFrame = 7;
        } else if( this.enemyType === enemy2){
            this.maxFrame = 4;
        }


        
        this.spriteWidth = 256;
        this.spriteHeight = 256; 

    }
    update(){
        this.x -= this.movement;
        if(frame % 10 === 0){
            // handle frames
            if(this.frameX < this.maxFrame) this.frameX++; 
            else this.frameX = this.minFrame;

        }
        
    }
    draw(){
        // For debug collision
       // ctx.fillStyle = 'red';
       // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'red';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        // draw Image on canvas , image, sourceX/Y/W/H e desination both
        //ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh) dx = position of enemy
        // how to animate sprite sheet 
        ctx.drawImage(this.enemyType,this.frameX * this.spriteWidth,0,this.spriteWidth,this.spriteHeight,
            this.x,this.y,this.width,this.height) 
       
    }
}
function handleEnemies(){
    for (let i = 0; i < enemies.length; i++){
        
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            gameOver = true;
        }
        // check enemy life
        if (enemies[i].health <= 0){
            // enemies[i].maxHealth/10;
            let gainedResources = 20
            floatingMessages.push(new floatingMessage(
                '+' + gainedResources, enemies[i].x, enemies[i].y, 30, 'gold'
            ));
            floatingMessages.push(new floatingMessage(
                '+' + gainedResources, 470,85, 30, 'gold'
            ));
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
          }
    }
    setTimeout(() => {
        setInterval(() => {
            socket.send(JSON.stringify({
                message: `a`
              }))
        }, 10000);
        
    },2000)
    if (frame % enemiesInterval === 0 && score < winningScore){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 50;
    }
  
}

// resources
const amounts = [30, 40, 50];
const coin = new Image();
coin.src = "coin.png"
class Resource {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
        this.frameX = 0;
        this.frameY = 0; 
        this.spriteWidth = 128;
        this.spriteHeight = 128;
        this.minFrame = 0;
        this.maxFrame = 3;  
    }
    draw(){
        // for devug
       // ctx.fillStyle = 'yellow';
       // ctx.fillRect(this.x, this.y, this.width, this.height);
        // drop image on position
        ctx.drawImage(coin, this.frameX * this.spriteWidth, 0, this.spriteWidth, 
            this.spriteHeight, this.x, this.y, this.width, this.height)



        ctx.fillStyle = 'gold';
        ctx.font = '20px Orbitron';
        ctx.fillText('+' + this.amount, this.x + 10, this.y + 0);
    }
    update(){
        if(frame % 10 === 0){
            // handle frames
            if(this.frameX < this.maxFrame) this.frameX++; 
            else this.frameX = this.minFrame;

        }
    }
}
function handleResources(){
    if (frame % 500 === 0 && score < winningScore){
        resources.push(new Resource());
    }

    
    // handle with creation of resorces
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
        resources[i].update();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            // add float message to resources
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x , resources[i].y, 30, 'gold'
            ));
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, 470, 85, 30, 'gold'));

            numberOfResources += resources[i].amount;
            console.log("Resource", numberOfResources, mouse, resources)
            resources.splice(i, 1);
            i--;
        }
    }
}

// utilities
function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score, 200, 40);
    ctx.fillText('Resources: ' + numberOfResources, 200, 80);
    if (gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0){
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + ' points!', 134, 340);
    }
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,controlsBar.width, controlsBar.height);
    handleGameGrid();
   handleBackground();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    // determina quem e desenhado primeiro
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages()
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})