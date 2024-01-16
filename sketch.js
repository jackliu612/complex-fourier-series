const POINT_SIZE = 5
const DEGREE = 10
let TIME_DELTA = 0.001

function setup() {
    size = min(windowHeight, windowHeight) - 100
    var canvas = createCanvas(size, size);
    // Move the canvas so it’s inside our <div id="sketch-holder">.
    canvas.parent('sketch-holder');

    pg = createGraphics(size, size);
}

let vertices = []
let path = null
let fPath = null
let fCoeffs = []
let time = 0
let showPath = false
let showCircles = false
let showOriginal = true
let px = 0, py = 0

function draw() {
    background(255, 0, 200);

    if (showOriginal) {
        drawLines(vertices)
        drawPoints(vertices)
    }

    if (showPath) {
        drawPath()
    }
    image(pg, 0, 0);

}

function drawPoints(points) {
    push()
    noStroke()
    for (let i = 0; i < points.length; i++) {
        ellipse(points[i][0], points[i][1], POINT_SIZE, POINT_SIZE);
    }

    if (keyIsDown(32)) {
        ellipse(mouseX, mouseY, POINT_SIZE, POINT_SIZE);
    }
    pop()
}

function drawLines(points) {
    push()
    stroke(255);
    strokeWeight(POINT_SIZE);
    for (let i = 1; i < points.length; i++) {
        let pointA = points[i - 1], pointB = points[i]
        line(pointA[0], pointA[1], pointB[0], pointB[1]);
    }

    if (keyIsDown(32) && points.length > 0) {
        line(points[points.length - 1][0], points[points.length - 1][1], mouseX, mouseY);
    }
    pop()
}

function drawFourier(coeffs) {
    push()
    ellipseMode(RADIUS)
    stroke(0);
    strokeWeight(2);
    let mid = DEGREE
    let curr = toPoint(coeffs[mid])
    for (let i = 1; i <= DEGREE; i++) {
        let vPos = toPoint(fourierTermHelper(coeffs[mid + i], i, time))
        let end = [curr[0] + vPos[0], curr[1] + vPos[1]]
        line(curr[0], curr[1], end[0], end[1])
        if (showCircles) {
            push()
            noFill()
            stroke(color(0, 0, 0, 128))
            strokeWeight(2)
            ellipseMode(RADIUS)
            ellipse(curr[0], curr[1], dist(curr[0], curr[1], end[0], end[1]), dist(curr[0], curr[1], end[0], end[1]))
            pop()
        }
        curr = end
        let vNeg = toPoint(fourierTermHelper(coeffs[mid - i], -i, time))
        end = [curr[0] + vNeg[0], curr[1] + vNeg[1]]
        line(curr[0], curr[1], end[0], end[1])
        if (showCircles) {
            push()
            noFill()
            stroke(color(0, 0, 0, 128))
            strokeWeight(2)
            ellipseMode(RADIUS)
            ellipse(curr[0], curr[1], dist(curr[0], curr[1], end[0], end[1]), dist(curr[0], curr[1], end[0], end[1]))
            pop()
        }
        curr = end
    }
    pop()
}

function drawPath() {
    if (showOriginal && path) {
        push()
        noStroke()
        fill(255)
        pt = path(time)
        ellipse(pt[0], pt[1], POINT_SIZE, POINT_SIZE);
        pop()
    }
    if (fPath) {
        drawFourier(fCoeffs)
        push()
        noStroke()
        fill(color(0, 72, 255, 200))
        pt = fPath(time)
        ellipse(pt[0], pt[1], POINT_SIZE * 2, POINT_SIZE * 2);
        pop()
        if (px!==0 || py!==0){
            pg.push()
            pg.stroke(0)
            pg.strokeWeight(POINT_SIZE);
            pg.line(px, py, pt[0], pt[1]);
            pg.pop()
        }
        px = pt[0]
        py = pt[1]
    }
    time += TIME_DELTA
    time %= 1
}

function calculateFourier() {
    vertices.push(vertices[0])
    path = pointsToFunc(vertices)
    fCoeffs = getFourierCoeffs(funcToComplex(path))
    fPath = fourierPathPartial(fCoeffs)
}

function reset() {
    vertices = []
    path = null
    fPath = null
    fCoeffs = []
    time = 0
    showPath = false
    showOriginal = true

    px = 0
    py = 0
    pg.clear()
}

function mousePressed() {
    if (keyIsDown(32)) {
        vertices.push([mouseX, mouseY])
    }
}

function keyReleased() {
    if (keyCode === 32 && vertices.length > 0) {
        calculateFourier()
    }
    return false; // prevent any default behavior
}

function keyPressed() {
    if (keyCode === 32) {
        reset()
    }

    if (keyCode === 80) {
        showPath = !showPath
    }

    if (keyCode === 67) {
        showCircles = !showCircles
    }

    if (keyCode === 79) {
        showOriginal = !showOriginal
    }

    if (keyCode === 187) {
        TIME_DELTA *= 1.5
    }

    if (keyCode === 189) {
        TIME_DELTA /= 1.5
    }
    //return false; // prevent any default behavior
}