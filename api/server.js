const http = require("http");
const path = require("path");
const { execFile } = require("child_process");

const PORT = process.env.PORT || 5000;

const projectRoot = path.join(__dirname, "..");

const cppExecutable = path.join(
    projectRoot,
    process.platform === "win32" ? "flight_api.exe" : "flight_api"
);

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });

    res.end(JSON.stringify(data));
}

function runCppApi(res, args = []) {
    execFile(
        cppExecutable,
        args,
        { timeout: 10000, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
            if (error) {
                console.error("C++ execution error:", error.message);
                console.error("C++ stderr:", stderr);

                sendJson(res, 500, {
                    success: false,
                    message: "C++ backend failed.",
                });
                return;
            }

            try {
                sendJson(res, 200, JSON.parse(stdout));
            } catch (parseError) {
                console.error("Invalid C++ JSON:", stdout);

                sendJson(res, 500, {
                    success: false,
                    message: "C++ returned invalid JSON.",
                });
            }
        }
    );
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;

            if (body.length > 100000) {
                reject(new Error("Request body too large"));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                reject(new Error("Invalid JSON body"));
            }
        });

        req.on("error", reject);
    });
}

const server = http.createServer(async (req, res) => {
    console.log("Request:", req.method, req.url);

    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/api/test") {
        sendJson(res, 200, {
            success: true,
            message: "Node API bridge is working!",
        });
        return;
    }

    if (req.method === "GET" && pathname === "/api/flights") {
        runCppApi(res);
        return;
    }

    if (req.method === "GET" && pathname === "/api/bookings") {
        runCppApi(res, ["--action", "bookings"]);
        return;
    }

    if (req.method === "POST" && pathname === "/api/bookings") {
        try {
            const body = await readBody(req);

            const flightNumber = String(body.flightNumber || "");
            const seatNumber = String(body.seatNumber || "");
            const passengerId = Number(body.passengerId);
            const bookingId = Number(body.bookingId);

            if (
                !/^[A-Za-z0-9-]{1,20}$/.test(flightNumber) ||
                !/^[A-Za-z0-9-]{1,10}$/.test(seatNumber) ||
                !Number.isSafeInteger(passengerId) ||
                passengerId <= 0 ||
                !Number.isSafeInteger(bookingId) ||
                bookingId <= 0
            ) {
                sendJson(res, 400, {
                    success: false,
                    message: "Invalid booking details.",
                });
                return;
            }

            runCppApi(res, [
                "--action", "book",
                "--flight", flightNumber,
                "--seat", seatNumber,
                "--passenger", String(passengerId),
                "--id", String(bookingId),
            ]);
        } catch (error) {
            sendJson(res, 400, {
                success: false,
                message: error.message,
            });
        }

        return;
    }

    const cancelMatch = pathname.match(/^\/api\/bookings\/(\d+)$/);

    if (req.method === "DELETE" && cancelMatch) {
        runCppApi(res, [
            "--action", "cancel",
            "--id", cancelMatch[1],
        ]);
        return;
    }

    sendJson(res, 404, {
        success: false,
        message: "Endpoint not found",
        requestedUrl: req.url,
        requestedMethod: req.method,
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("SkyBook API listening on port", PORT);
    console.log("C++ executable:", cppExecutable);
});
