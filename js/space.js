
(function (){
    'use Strict';

    var canvas, ctx, canvasWidth= 0, canvasHeight= 0, idCounter= 1,
        allBalls = [], arrowDirection = 0, move=true, radius = 20, shoot=false, activeBall, speed=0.2, toPop = new Array(), gameOver = false;;
        allColors = new Array("blue", "green", "yellow"), removeAnimationFinished = false;

    // Ball Object
    Ball = function () {
        this.id = idCounter++;

        this.radius = radius;
        this.x = 0;
        this.y = 0;

        this.vX = 0;
        this.vY = 0;
        this.color = allColors[ parseInt(rand(allColors.length)) ];

        this.draw = function () {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
            ctx.closePath();
            ctx.fill();
        };

        this.move = function () {
            this.y -= this.vY;
            this.x += this.vX
        };
        return this;
    };

    animate = function () {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        checkGameStatus();

        for(i in allBalls) {
            var b = allBalls[i];
            b.draw();
            ctx.fillStyle = "red";
            ctx.font = "bold 20px Arial";
            ctx.fillText(b.id, b.x, b.y);
        }

        activeBall.draw();
        if(shoot) {
            if(!checkCollision(activeBall))
                activeBall.move();
        }

        strokeX = canvas.width/2 + arrowDirection;
        strokeY = canvas.height - Math.sqrt((100*100) - (arrowDirection * arrowDirection))

        ctx.beginPath();
        ctx.moveTo(canvas.width/2,canvas.height-radius);
        ctx.lineTo(strokeX,strokeY );
        ctx.strokeStyle = "#fff";
        ctx.stroke();

        if(!gameOver)
            setTimeout(animate,33);
    };

    init = function() {
        var wrapper = $('#bubbleShooter');
        canvas = document.createElement("canvas");
        canvas.width = wrapper.width();
        canvas.height = wrapper.height();
        ctx = canvas.getContext('2d');
        wrapper.append(canvas);

        //$(canvas).bind('mousemove', function(e) { mouseMove(e); })
        //$(canvas).bind('click',  function(e) { controlls(e); })
        reset();
        newBall();
    };

    reset = function() {
        var numStartBalls = 4;

        posX = canvas.width/2 - ((numStartBalls * radius)/2 )-5;
        if(numStartBalls % 2 == 0) posX -= radius;
        for(var i=0; i< numStartBalls; i++) {
            b  = new Ball();
            b.y = radius;
            b.x = posX + i* (radius*2);
            allBalls.push(b)
        }

    }

    controlls = function (e) {
        move = true;
        keyCode = e.keyCode;
        if(typeof keyCode == 'undefined') keyCode = e.type;

        /* * * * * * * * * *
        * Keycodes:         *
        * ---------         *
        * 32 = spacebar     *
        * 37 = Arrow Left   *
        * 38 = Arrow Up     *
        * 39 = Arrow Right  *
        * 40 = Arrow Down   *
        * * * * * * * * * * */
        if((keyCode == 32 || keyCode == 38 || keyCode == 'click') && !shoot) {shoots(); return; }
        if(keyCode != 37 && keyCode != 39) return;

        moveLoop = function ()
        {
            //console.log(arrowDirecion)t
            if(!move) return;
            if(keyCode == 39 && arrowDirection < 80) arrowDirection+=5;
            if(keyCode == 37 && arrowDirection > -80) arrowDirection-=5;
            setTimeout(moveLoop,50)
        };
        moveLoop();
    };

    mouseMove = function(e) {
        posX = e.offsetX;
        if(posX < 80 || posX > -80){
            multiplikator = (posX < canvasWidth /2 ) ? -1 : 1;
            arrowDirection = (posX ) * multiplikator;
        }
    };

    controllsUp = function () {
        move = false;
    };

    shoots = function () {
        shoot = true;

        activeBall.vX = (strokeX - activeBall.x);
        activeBall.vY = ((canvas.height - strokeY) - (canvas.height - activeBall.y));

        activeBall.vX *= speed;
        activeBall.vY *= speed;
    };

    checkCollision = function (ball) {
        if(ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) ball.vX *= -1;
        if(ball.y <= ball.radius){
            ball.vY = 0;
            ball.vX = 0;
            ball.y += ball.radius - ball.y;
            allBalls.push(ball);
            newBall();
            return false;
        }

        for(i in allBalls) {
            var bA = allBalls[i],
                dX = bA.x - ball.x,
                dY = bA.y - ball.y,
                distance = Math.sqrt((dX*dX)+(dY*dY));

            if(distance < radius*2) {
                ball.vY = 0;
                ball.vX = 0;
                activeBall.y += radius*2-distance;
                allBalls.push(ball);

                toPop = new Array();
                toCheckColor = allBalls[allBalls.length-1].color;
                checkWin(allBalls[allBalls.length-1]);

                newBall();
                return true;
            }
        }
    };

    newBall = function () {
        shoot=false;
        activeBall = new Ball();
        activeBall.x = canvas.width/2;
        activeBall.y = canvas.height - activeBall.radius;
        //activeBall.color = getValidColor();
    };


    checkWin = function(toCheck) {
        for(i in allBalls) {
            var b = allBalls[i],
                dX = toCheck.x - b.x,
                dY = toCheck.y - b.y,
                distance = Math.sqrt((dX*dX)+(dY*dY));

            if(distance <= radius*2 && b.color === toCheckColor && !in_array(b.id, toPop)) {
                toPop.push(b.id);
                checkWin(b);
                return;
            }
        }

        var lastBall = allBalls[allBalls.length-1].id;
        if(!in_array(lastBall,toPop)) toPop.push(lastBall);
        if(toPop.length > 2) removeAnimation(toPop);
    };

    removeBalls = function (toPop) {
        var newBalls = new Array();
        for(b in allBalls) if(!in_array(allBalls[b].id,toPop)) newBalls.push(allBalls[b]);
        allBalls = newBalls;
        checkStandAloneBalls();
    };


    checkStandAloneBalls = function() {
        toPop = new Array();
        for(i in allBalls) {
            var toCheck = allBalls[i]
                if(
                       toCheck.x <= radius // linker rand
                    || toCheck.x >= canvas.width - radius // rechter rand
                    || toCheck.y <= radius // oberer rand
                    || hasNextBall(toCheck) //ball am körper
                ) continue;
            toPop.push(toCheck.id);
        }
        if(toPop.length) removeAnimation(toPop);
    };

    checkGameStatus = function () {
        if(allBalls.length == 0) {
            alert("You win!");
           // gameOver = true;
            reset();
            return;
        }

        for(i in allBalls) {
            if(allBalls[i].y + radius > canvas.height - radius) {
                alert("You lose!");
                gameOver = true;
                return;
            }
        }
    };

    removeAnimation = function() {
        var actRadius = radius;
        var tempToPop = [];
        for(i in toPop) tempToPop.push(toPop[i]);
        (function innerLoop(){
            if((actRadius -= 2) <= 0) { removeBalls(tempToPop); return; }
            for(var i in tempToPop) getBallById(tempToPop[i]).radius = actRadius;
            setTimeout(innerLoop, 50);
        })();
    };

    // HelpFunction
    function in_array(item,arr) { for(var p = 0; p < arr.length; p++) if(item == arr[p]) return true; return false; }
    function getBallById(ballId) { for(var i in allBalls) if(allBalls[i].id == ballId) return allBalls[i]; return false; }
    function rand (max, min) { if(!min) min = 0; return Math.random() * (max-min) + min; };
    function getValidColor () {
        var color = allColors[ parseInt(rand(allColors.length)) ],
            allValidBalls = [];
        for(var i in allBalls) if(!in_array(allBalls[i].id,toPop)) allValidBalls.push(allBalls[i]);
        for(var i in allValidBalls) if(allValidBalls[i].color == color) return color; getValidColor();
    }

    function hasNextBall(toCheck) {
        for(i in allBalls) {
            var b = allBalls[i],
                dX = toCheck.x - b.x,
                dY = toCheck.y - b.y,
                distance = Math.sqrt((dX*dX)+(dY*dY));

            if(toCheck.id == b.id || toCheck.y < b.y) { continue; }
            if(distance <= radius*2) return true;
        }
        return false;
    }

    $(document).ready(function () {
        $(document).bind('keydown',controlls);
        $(document).bind('keyup',controllsUp);

        init();
        animate();
    });

})();