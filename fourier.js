INTEGRATION_DELTA = 0.005

function pointsToFunc(points) {
    let rawDistances = []
    for (let i = 1; i < points.length; i++) {
        rawDistances.push(dist(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]))
    }
    let totalDistance = rawDistances.reduce((sum, current) => sum + current, 0)

    let normalizedDistances = [0]
    let temp = 0
    for (let d of rawDistances) {
        temp += d
        normalizedDistances.push(temp / totalDistance)
    }
    return (t) => {
        let idx = 1
        while (t > normalizedDistances[idx]) {
            idx++
        }
        let start = points[idx - 1], end = points[idx]
        let ratio = (t - normalizedDistances[idx - 1]) / (normalizedDistances[idx] - normalizedDistances[idx - 1])

        return [lerp(start[0], end[0], ratio), lerp(start[1], end[1], ratio)]
    }
}

function fourierPath(fn, degree = DEGREE) {
    return funcToPoint(fourierSeries(funcToComplex(fn), degree))
}

function fourierPathPartial(coeffs, degree = DEGREE) {
    return funcToPoint(fourierSeriesPartial(coeffs, degree))
}

function integrate(fn, delta = INTEGRATION_DELTA) {
    let sum = 0
    for (let i = 0; i <= 1; i += delta) {
        sum = math.add(sum, math.multiply(fn(i), delta))
    }
    return sum
}

function fourierCoeff(n, fn) {
    integrand = (x) => {
        let exponent = math.chain(math.i)
            .multiply(-2 * math.PI * n)
            .multiply(x)
            .done()
        return math.multiply(fn(x), math.exp(exponent))
    }
    return integrate(integrand)
}

function getFourierCoeffs(fn, degree = DEGREE) {
    let coeffs = []
    for (let i = -degree; i <= degree; i++) {
        coeffs.push(fourierCoeff(i, fn))
    }
    return coeffs
}

function fourierSeries(fn, degree = DEGREE) {
    let coeffs = getFourierCoeffs(fn, degree)
    return (x) => {
        let sum = 0
        for (let n = -degree; n <= degree; n++) {
            term = fourierTermHelper(coeffs[n + degree], n, x)
            sum = math.add(sum, term)
        }
        return sum
    }
}

function fourierSeriesPartial(coeffs, degree = DEGREE) {
    return (x) => {
        let sum = 0
        for (let n = -degree; n <= degree; n++) {
            term = fourierTermHelper(coeffs[n + degree], n, x)
            sum = math.add(sum, term)
        }
        return sum
    }
}

function fourierTermHelper(coeff, n, x) {
    let exponent = math.chain(math.i)
        .multiply(2 * math.PI * n)
        .multiply(x)
        .done()
    return math.multiply(coeff, math.exp(exponent))

}

function funcToComplex(fn) {
    return (t) => {
        p = fn(t)
        return toComplex(p)
    }
}

function funcToPoint(fn) {
    return (t) => {
        complex = fn(t)
        return toPoint(complex)
    }
}

function toComplex(p) {
    return math.complex(p[0], p[1])
}

function toPoint(complex) {
    return [math.re(complex), math.im(complex)]
}