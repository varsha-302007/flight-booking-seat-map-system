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

function runCppApi(res) {
    console.log("Executing C++ program:", cppExecutable);

    execFile(cppExecutable, (error, stdout, stderr) => {
        if (error) {
            console.error("C++ execution error:", error);
            console.error("C++ stderr:", stderr);

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
            console.error("Invalid JSON returned by C++:", stdout);

            sendJson(res, 500, {
                success: false,
                message: "C++ returned invalid JSON.",
                output: stdout,
            });
        }
    });
}

const server = http.createServer((req, res) => {
    // DEBUG: Display every incoming request
    console.log("Request received:", req.method, req.url);

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });

        res.end();
        return;
    }

    // Health-check endpoint
    if (req.method === "GET" && new URL(req.url, `http://${req.headers.host}`).pathname === "/api/test") {
        sendJson(res, 200, {
            success: true,
            message: "Node API bridge is working!",
        });

        return;
    }

    // Flight endpoint
    // Flight endpoint
if (
    req.method === "GET" &&
    new URL(req.url, `http://${req.headers.host}`).pathname === "/api/flights"
) {
    console.log("Flight endpoint matched!");
    runCppApi(res);
    return;
}

    // Unknown endpoint
    console.log("Unknown endpoint:", req.method, req.url);

    sendJson(res, 404, {
        success: false,
        message: "Endpoint not found",
        requestedUrl: req.url,
        requestedMethod: req.method,
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("       SKYBOOK API BRIDGE");
    console.log("====================================");
    console.log(`Server listening on port ${PORT}`);
    console.log(`C++ executable: ${cppExecutable}`);
    console.log("");
    console.log("Available endpoints:");
    console.log(`GET http://localhost:${PORT}/api/test`);
    console.log(`GET http://localhost:${PORT}/api/flights`);
    console.log("====================================");
});