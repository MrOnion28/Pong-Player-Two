var racket;
var ball;
var wall1;
var wall2;
var wall3;
let ball_exist = false;
var ball_velocity = 25;
var racket_velocity = 15;
function setup() {
    createCanvas(1200, 600);
    wall1 = {x:0, y:height-50, width:width, height:50}
    wall2 = {x:0, y:0, width:width, height:50}
    wall3 = {x:width-50, y:wall2.height, width:50, height:height - wall2.height - wall1.height}

    racket = new Racket();
}
function draw() {
    background(0);
    if (keyIsDown(UP_ARROW)||keyIsDown(87)) {
        racket.y -= racket_velocity;
        while (racket.y < wall2.height) {
            racket.y += racket_velocity*0.1;
        }
    }
    if (keyIsDown(DOWN_ARROW)||keyIsDown(83)) {
        racket.y += racket_velocity;
        while (racket.y > height - wall1.height - 100) {
            racket.y -= racket_velocity*0.1;
        }
    }
    racket.show();
    //racket.think()
    if (ball_exist) {
        ball.x += (ball.move_x)*ball_velocity
        ball.y += (ball.move_y)*ball_velocity
        ellipse(ball.x, ball.y, ball.width, ball.height)
        if (ball.y - ball.width/2 <= wall2.y+wall2.height||ball.y + ball.width/2 >= wall1.y) {
            ball.move_y *= -1
        }
        if (ball.x + ball.width/2 >= wall3.x) {
            ball.move_x *= -1
        }
        if (checkCollision() && ball.move_x < 0 ) {
            nomarlised_y = ((racket.y + racket.height / 2) - ball.y)/(racket.height/2)
            max_angle = Math.PI / 4
            bounce_angle = nomarlised_y * max_angle
            ball.move_x = Math.cos(bounce_angle) 
            ball.move_y = -Math.sin(bounce_angle)
            ball.x = racket.x + racket.width + ball.width / 2
        }
        if (ball.x > width) {
            Ball()
        }
    }

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
function Racket() {
    this.y = height/2-50
    this.x = 50
    this.width = 20
    this.height = 100
    this.show = function() {
        fill(255,255,255)
        rect(this.x, this.y, this.width, this.height)
        rect(wall1.x, wall1.y, wall1.width, wall1.height)
        rect(wall2.x, wall2.y, wall2.width, wall2.height)
        rect(wall3.x, wall3.y, wall3.width, wall3.height)
    }
}


function keyPressed() {
    if (keyCode === 32) {
        Ball()
    }
}
function Ball() {
    ball_exist = true
    rand_y  = getRandomInt(wall2.height + 20, height - wall1.height - 20)
    move_x = 1
    move_y = 0
    ball = {x: width/2, y: rand_y,width:20, height:20, move_x: move_x, move_y: move_y}
}

function checkCollision() {
    if (ball.x >= racket.x && ball.x <= racket.x + racket.width && ball.y >= racket.y && ball.y <= racket.y + racket.height) {
        return true;
    } else {
        return false;
    }
}