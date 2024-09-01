const view = document.getElementById("view");
const ctx = view.getContext("2d");
const acceptButton = document.getElementById("accept");
const rules = document.getElementsByClassName("rule");
const error = document.getElementById("error");

const PI = Math.PI; //3.141592653589793238462643383279;
const TAU = PI*2;

const WID = 700;
const HWID = 350;

var reference = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class L_System {
    constructor() {
        this.draw = "";
        this.skip = "";
        this.axiom = "";
        this.rules = new Array(26);
        this.angle = 0;
        this.startAngle = 0;
        this.currentAngle = 0;
        this.iterations = 1;
        this.pos = [0,0];
        this.extremes = [0,0,0,0];
    }
}

var s1 = new L_System();


var test = "12 3 45"
test = test.replace(/ /g, ''); // remove spaces

s1.draw = "AB";
s1.axiom = "A";
s1.rules[0] = "A-B--B+A++AA+B-";
s1.rules[1] = "+A-BB--B-A++A+B";
s1.angle = PI/3.0;
s1.iterations = 4;
ctx.strokeStyle = "white";
ctx.strokeLine
draw();

acceptButton.addEventListener("click", function() {

    s1.draw = document.getElementById("draw").value.toUpperCase();
    if(s1.draw == "") {
        error.textContent = "Please provide symbols to draw"
        error.hidden = false;
        return;
    }
    s1.skip = document.getElementById("skip").value.toUpperCase();
    s1.axiom = document.getElementById("axiom").value.toUpperCase();
    if(s1.axiom == "") {
        error.textContent = "Please provide a starting axiom"
        error.hidden = false;
        return;
    }
    s1.iterations = document.getElementById("iterations").value;
    s1.angle = document.getElementById("angle").value / 180.0 * PI;
    if(s1.iterations == 0) {
        error.textContent = "Please provide the number of recursions to be performed"
        error.hidden = false;
        return;
    }

    s1.pos = [0,0];
    s1.currentAngle = s1.startAngle;
    s1.extremes = [0,0,0,0];

    var text;
    var c;
    for(var i = 0; i < 26; i++)
        s1.rules[i] = "";
    for(var i = rules.length - 1; i >= 0; --i) {
        text = rules[i].value.replace(/ /g, '').toUpperCase();
        if((c = reference.indexOf(text.charAt(0))) != -1 && text.charAt(1) == '=') {
            s1.rules[c] = text.slice(2);
            console.log(s1.rules[c]);
        }
        else if(text != "") {
            error.textContent = "Invalid rule. Rules must be in the format: <Letter>=<Rule>"
            error.hidden = false;
            return;
        }
    }
    error.hidden = true;
    ctx.strokeStyle = document.getElementById("lineColor").value;
    ctx.lineWidth = document.getElementById("lineWidth").value;
    view.style.backgroundColor = document.getElementById("backgroundColor").value;
    draw();

});

function draw() {
    ctx.clearRect(0,0,700,700);
    generate(s1,s1.iterations,s1.axiom,false);
    var tmp = s1.extremes[2];
    s1.extremes[2] = (s1.extremes[1] - s1.extremes[0]) > (s1.extremes[3] - s1.extremes[2]) ? (s1.extremes[1] - s1.extremes[0])/2.0 * 1.1 : (s1.extremes[3] - s1.extremes[2])/2.0 * 1.1;
    s1.extremes[0] = (s1.extremes[1] + s1.extremes[0]) / 2.0;
    s1.extremes[1] = (s1.extremes[3] + tmp) / 2.0;
    console.log(s1.extremes);
    s1.pos = [0,0];
    s1.currentAngle = s1.startAngle;
    generate(s1,s1.iterations,s1.axiom,true);
} 

function generate(sys, iteration, text, draw) {
    var c;
    var tmpRule;
    var brackets = [];
    var goTo = -1;
    var tmp = [0,0];
    for(var i = 0; (c = text.charAt(i)) != 0; ++i) {
        if(reference.indexOf(c) != -1) { // if its a letter rule
            tmpRule = sys.rules[reference.indexOf(c)];
            if(iteration == 0 || tmpRule == "") {
                if(sys.draw.indexOf(c) != -1) {
                    tmp[0] = sys.pos[0];
                    tmp[1] = sys.pos[1];
                    sys.pos[0] += Math.cos(sys.currentAngle);
                    sys.pos[1] += Math.sin(sys.currentAngle);
                    if(draw) {
                        ctx.beginPath();
                        ctx.moveTo((tmp[0] - sys.extremes[0]) / sys.extremes[2] * HWID + HWID,(tmp[1] - sys.extremes[1]) / sys.extremes[2] * HWID + HWID);
                        ctx.lineTo((sys.pos[0] - sys.extremes[0]) / sys.extremes[2] * HWID + HWID,(sys.pos[1] - sys.extremes[1]) / sys.extremes[2] * HWID + HWID);
                        ctx.stroke();
                    }
                }
                else if(sys.skip.indexOf(c) != -1) {
                    sys.pos[0] += Math.cos(sys.currentAngle);
                    sys.pos[1] += Math.sin(sys.currentAngle);
                }
                if(!draw) {
                    if(sys.pos[0] < sys.extremes[0])
                        sys.extremes[0] = sys.pos[0];
                    else if(sys.pos[0] > sys.extremes[1])
                        sys.extremes[1] = sys.pos[0];
                    if(sys.pos[1] < sys.extremes[2])
                        sys.extremes[2] = sys.pos[1];
                    else if(sys.pos[1] > sys.extremes[3])
                        sys.extremes[3] = sys.pos[1];
                }
            }
            else if(tmpRule != "") {
                generate(sys,iteration-1,tmpRule,draw);
            }
        }
        else if(c == '+')
            sys.currentAngle += sys.angle;
        else if(c == '-')
            sys.currentAngle -= sys.angle;
        else if(c == '[') {
            brackets.push([sys.pos[0],sys.pos[1],sys.currentAngle]);
            goTo++;
        }
        else if(c == ']') {
            sys.pos[0] = brackets[goTo][0];
            sys.pos[1] = brackets[goTo][1];
            sys.currentAngle = brackets[goTo][2];
            brackets.pop();
            goTo--;
        }
    }
}