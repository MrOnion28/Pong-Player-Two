let racket_population = []
var racket_num = 100
var wall1
var wall2
var wall3
var ball_velocity = 15
var racket_velocity = 20
var all_dead = false
var gens = 0
var gen_angle = getRandomNum(-Math.PI/4,Math.PI/4)
var render = false
var training = true
var ai_brain = null
var max_gens = 1000
let player
let ai 
let ball
var player_score = 0
var ai_score = 0
var best_score = 0
function setup() {
    createCanvas(1200, 600)
    player = new Racket(null,false)
    ai = {x:width-70, y:100,height:100,width:20}
    ball = new Ball()
    wall1 = {x:0, y:height-50, width:width, height:50}
    wall2 = {x:0, y:0, width:width, height:50}
    wall3 = {x:width-50, y:wall2.height, width:50, height:height - wall2.height - wall1.height}
    for (let x = 0; x < racket_num;x++) {
        racket_population.push(new Racket(null,false))
    }
}
function draw() {
    background(0)
    rect(wall1.x, wall1.y, wall1.width, wall1.height)
    rect(wall2.x, wall2.y, wall2.width, wall2.height)
    if (training){
        for (let c = 0; c < 100000; c++) {
            all_dead = true;
            for (let x = 0; x < racket_num; x++) {
                if (racket_population[x].isdead == false) {
                    racket_population[x].update();
                    all_dead = false;
                }
            }
            if (all_dead) {
                nextGen()
                return
            }
        } 
        for (let x = 0; x < racket_num; x++) {
            if (racket_population[x].isdead == false && render) {
                racket_population[x].show()
            }
        }
    } else {
        ellipse(ball.x,ball.y,ball.height,ball.width)
        ball.x += ball.move_x * ball_velocity
        ball.y += ball.move_y * ball_velocity  
        if (keyIsDown(UP_ARROW)||keyIsDown(87)) {
            player.y -= racket_velocity;
            while (player.y < wall2.height) {
                player.y += racket_velocity*0.1;
            }
        }
        if (keyIsDown(DOWN_ARROW)||keyIsDown(83)) {
            player.y += racket_velocity;
            while (player.y > height - wall1.height - player.height) {
                player.y -= racket_velocity*0.1;
            }
        }
        let info = [(ball.y - (ai.y + ai.height/2)) / height,ball.move_y]
        let move = ai_brain.think(info);
        if (move == "UP") {
            ai.y -= racket_velocity;
            while (ai.y < wall2.height) {
                ai.y += racket_velocity*0.1;
            }
        }
        if (move == "DOWN") {
            ai.y += racket_velocity
            while (ai.y > height - wall1.height - ai.height) {
                ai.y -= racket_velocity*0.1;
            }
        }
        player.show()
        fill(255,255,255)
        rect(ai.x,ai.y,ai.width,ai.height)
        checkCollisions()
        if(player_score >= 10){
            document.getElementById("score").innerText = "YOU WIN"
            noLoop()
        } else if(ai_score >= 10){
            document.getElementById("score").innerText = "YOU LOSE"
            noLoop()
        } else {
            document.getElementById("score").innerText = player_score + " : " + ai_score
        }
    }
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}
function Racket(brain,brain_exist) {
    this.y = height/2-50 //getRandomInt(wall2.height+100,height-wall1.height-100)
    this.x = 50
    this.width = 20
    this.height = 100
    this.isdead = false
    this.score = 0
    this.fitness = 0
    this.ball = new Ball()
    if (brain_exist){
        this.brain = brain
    } else {        
        this.brain = new NeuralNetwork(2,8,1)
    }
    this.show = function() {
        fill(255,255,255)
        rect(this.x, this.y, this.width, this.height)
    }
    this.update = function() {
        if (this.isdead) {
            return
        }
        this.info = [
        (this.ball.y - (this.y + this.height / 2)) / height,
        this.ball.move_y,
        //this.ball.move_x,
        //this.ball.x / width
        ]
        let uod = this.brain.think(this.info)
        if (uod == "UP") {
            this.y -= racket_velocity
            if (this.y < wall2.height) {
                this.y = wall2.height
            }
        } else if (uod == "DOWN") {
            this.y += racket_velocity
            if (this.y > height - wall1.height - this.height) {
                this.y = height - wall1.height - this.height
            }
        }
        this.ball.x += (this.ball.move_x)*ball_velocity
        this.ball.y += (this.ball.move_y)*ball_velocity
        if (render) {
            ellipse(this.ball.x, this.ball.y, this.ball.width, this.ball.height)
        }
        if (this.ball.y - this.ball.width/2 <= wall2.y+wall2.height||this.ball.y + this.ball.width/2 >= wall1.y) {
            this.ball.move_y *= -1
        }
        if (this.ball.x + this.ball.width/2 >= wall3.x) {
            this.ball.move_x *= -1
        }
        if (this.ball.x >= this.x && this.ball.x <= this.x + this.width && this.ball.y >= this.y && this.ball.y <= this.y + this.height && this.ball.move_x < 0 ) {
            let normalised_y = ((this.y + this.height / 2) - this.ball.y)/(this.height/2)
            let max_angle = Math.PI / 4
            let bounce_angle = normalised_y * max_angle
            this.ball.move_x = Math.cos(bounce_angle) 
            this.ball.move_y = -Math.sin(bounce_angle)
            this.ball.x = this.x + this.width + this.ball.width / 2
            this.score += 1
        }
        if (this.ball.x < 0) {
            this.fitness = this.score*this.score*10000 + this.score * 1000       
            this.isdead = true
        }
        if (this.score > 10) {
            gens = max_gens
            this.score = 10
        }
    }
}
function Ball() {
    if (training) {
        this.move_x = Math.cos(gen_angle)
        this.move_y = -Math.sin(gen_angle)
    } else {
        num = getRandomNum(-Math.PI/4,Math.PI/4) 
        this.move_x = -Math.cos(num)
        this.move_y = Math.sin(num)
    }
    this.x = width / 2
    this.y = height / 2
    this.width = 20
    this.height = 20
}
function nextGen(){
    let total = 0
    for(let x =0;x<racket_num;x++){
        total += racket_population[x].score;
    }
    if (gens < max_gens && best_score < 10) {
        gens++
        racket_population.sort((a,b) => b.fitness - a.fitness)
        let good_brains = racket_population.slice(0,10)
        let new_guys = []
        for (let x=0;x<good_brains.length;x++){
            new_guys.push(new Racket(good_brains[x].brain.copy(),true))
        }
        while (new_guys.length < racket_num) {
            let brain
            let num = Math.random()
            if (num < 0.5){
                brain = good_brains[0].brain.copy()
            } else if (num < 0.75) {
                brain = good_brains[1].brain.copy()
            } else if (num < 0.875) {
                brain = good_brains[2].brain.copy()
            } else if (num < 0.9375) {
                brain = good_brains[3].brain.copy()
            } else {
                brain = good_brains[getRandomInt(4,good_brains.length)].brain.copy()
            }
            brain.mutate(0.05) 
            new_guys.push(new Racket(brain,true))
        }
        racket_population = new_guys
        document.getElementById("troubleshooting").innerHTML = "Loading - "+Math.floor(100*gens/max_gens)+"%"
        best_score = good_brains[0].score
        console.log(
        "Generation:", gens,
        "Best:", good_brains[0].score,
        "Average:", total/racket_num

        );
    } else {
        document.getElementById("troubleshooting").innerHTML = ""
        racket_population.sort((a,b)=>b.fitness-a.fitness);
        let best =racket_population[0];
        ai_brain = best.brain.copy();
        training = false
        render = true
    }
}
function getRandomNum(min,max) {
    return Math.random()*(max-min) + min
}
function checkCollisions() {
    if (ball.x >= player.x && ball.x <= player.x + player.width && ball.y >= player.y && ball.y <= player.y + player.height && ball.move_x < 0) {
        nomarlised_y = ((player.y + player.height / 2) - ball.y)/(player.height/2)
        max_angle = Math.PI / 4
        bounce_angle = nomarlised_y * max_angle
        ball.move_x = Math.cos(bounce_angle) 
        ball.move_y = -Math.sin(bounce_angle)
        ball.x = player.x + player.width + ball.width / 2
    }
    if (ball.x >= ai.x && ball.x <= ai.x + ai.width && ball.y >= ai.y && ball.y <= ai.y + ai.height && ball.move_x > 0
) {
        nomarlised_y = ((ai.y + ai.height / 2) - ball.y)/(ai.height/2)
        max_angle = Math.PI / 4
        bounce_angle = nomarlised_y * max_angle
        ball.move_x = -Math.cos(bounce_angle) 
        ball.move_y = Math.sin(bounce_angle)
        ball.x = ai.x - ball.width / 2
    }
    if (ball.y - ball.width/2 <= wall2.y+wall2.height||ball.y + ball.width/2 >= wall1.y) {
        ball.move_y *= -1
    }
    if (ball.x < 0){
        ai_score++
        ball = new Ball
    }
    if (ball.x > width) {
        player_score++
        ball = new Ball
    }
}
class NeuralNetwork {
    constructor(inputs,hidden,output) {
        this.inputs = inputs
        this.hidden = hidden
        this.output = output
        this.weights = []
        this.biases = []
        this.hidden_biases = []
        this.hidden_weights = []
        for (let i = 0;i < this.hidden; i++) {
            let input_weight = []
            for (let x = 0;x < this.inputs; x++){
                input_weight.push(getRandomNum(-1,1))
            }
            this.weights.push(input_weight)
            this.biases.push(getRandomNum(-1,1))
        }
        for (let i = 0;i < this.output; i++) {
            let input_weight = []
            for (let x = 0;x < this.hidden; x++){
                input_weight.push(getRandomNum(-1,1))
            }
            this.hidden_weights.push(input_weight)
            this.hidden_biases.push(getRandomNum(-1,1))
        }
    }
    copy() {
        let clone = new NeuralNetwork(this.inputs,this.hidden,this.output)
        clone.weights = []
        clone.biases = []
        clone.hidden_weights= []
        clone.hidden_biases = []
        for (let x = 0;x<this.hidden;x++){
            let input_weight = []
            for (let y =0;y<this.inputs;y++) {
                input_weight.push(this.weights[x][y])
            }
            clone.weights.push(input_weight)
            clone.biases.push(this.biases[x])
        }
        for (let i = 0;i<this.output;i++){
            let input_weight = []
            for (let x = 0;x<this.hidden;x++) {
                input_weight.push(this.hidden_weights[i][x])
            }
            clone.hidden_weights.push(input_weight)
            clone.hidden_biases.push(this.hidden_biases[i])

        }
        return clone;
    }
    think(info){
        let neuron_sums = []
        for (let i = 0;i < this.hidden; i++) {
            let sum = 0
            for (let x = 0;x < this.inputs; x++){
                sum += info[x]*this.weights[i][x]
            }
            sum += this.biases[i]
            neuron_sums.push(Math.tanh(sum))
        }
    
        let move = []
        for (let i = 0;i < this.output; i++) {
            let sum = 0
            for (let x = 0;x < this.hidden; x++){
                sum += neuron_sums[x]*this.hidden_weights[i][x]
            }
            sum += this.hidden_biases[i]
            move.push(Math.tanh(sum))
        }
        let uod = 0
        if (move[0] > 0){
            uod = "UP"
        } else if (move[0] < 0){
            uod = "DOWN"
        } else {
            uod = "STAY"
        }
        return uod
    }
    mutate(rate) {
        let mutate_rate = 0.1
        let num = 0
        for(let x = 0;x < this.hidden;x++){
            for(let y = 0;y < this.inputs;y++){
                if (Math.random()<rate){
                    num = getRandomNum(-0.1,0.1)
                    this.weights[x][y] += num
                }
            }
            if (Math.random()<rate){
                num = getRandomNum(-mutate_rate,mutate_rate)
                this.biases[x] += num
            }
            
        }  
        for(let x = 0;x < this.output;x++){
            for(let y = 0;y < this.hidden;y++){
                if (Math.random()<rate){
                    num = getRandomNum(-0.1,0.1)
                    this.hidden_weights[x][y] += num
                }
            }
            if (Math.random()<rate){
                num = getRandomNum(-mutate_rate,mutate_rate)
                this.hidden_biases[x] += num
            }
            
        }
    }    
}