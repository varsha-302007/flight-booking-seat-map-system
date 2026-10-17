const http = require("http");
const { execFile } = require("child_process");
const path = require("path");

const PORT = 5000;

const projectRoot = path.join(__dirname, "..");
const cppExecutable = path.join(projectRoot, "flight_api.exe");

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });

    res.end(JSON.stringify(data));
}

function runCppApi(res) {
    execFile(cppExecutable, (error, stdout, stderr) => {
        if (error) {
            console.error("C++ execution error:");
            console.error(error);

            console.error("C++ stderr:");
            console.error(stderr);

            sendJson(res, 500, {
                success: false,
                message: "C++ backend failed.",
                error: error.message,
            });

            return;
        }

        try {
            const result = JSON.parse(stdout);

            sendJson(res, 200, result);
        } catch (parseError) {
            console.error("Invalid JSON returned by C++:");
            console.error(stdout);

            sendJson(res, 500, {
                success: false,
                message: "C++ returned invalid JSON.",
                output: stdout,
            });
        }
    });
}

const server = http.createServer((req, res) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
                "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type",
        });

        res.end();
        return;
    }

    // Test endpoint
    if (
        req.method === "GET" &&
        req.url === "/api/test"
    ) {
        sendJson(res, 200, {
            success: true,
            message: "Node API bridge is working!",
        });

        return;
    }

    // Real C++ endpoint
    if (
        req.method === "GET" &&
        req.url === "/api/flights"
    ) {
        console.log("GET /api/flights");

        runCppApi(res);

        return;
    }

    // Endpoint not found
    sendJson(res, 404, {
        success: false,
        message: "Endpoint not found",
    });
});

server.listen(PORT, () => {
    console.log("====================================");
    console.log("       SKYBOOK API BRIDGE");
    console.log("====================================");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("");
    console.log("Available endpoints:");
    console.log("GET /api/test");
    console.log("GET /api/flights");
    console.log("====================================");
});