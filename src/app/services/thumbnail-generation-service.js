// server.ts
import express from "express";
import puppeteer from "puppeteer";
import bodyParser from "body-parser";
import sharp from "sharp";
import { KafkaJS } from "@confluentinc/kafka-javascript";
import fs from 'fs';


const { Kafka } = KafkaJS;
const app = express();
const port = process.env["PORT"] || 3000;
app.use(bodyParser.json({ limit: "1mb" }));
app.post("/thumbnail", async (req, res) => {
    const { htmlContent, width = 1280, height = 720, thumbnailWidth = 320, } = req.body;
    if (!htmlContent) {
        return res.status(400).json({ error: "htmlContent is required" });
    }
    let browser;
    try {
        browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setViewport({ width, height });
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        const fullScreenshot = await page.screenshot({ fullPage: true });
        const thumbnail = await sharp(fullScreenshot)
            .resize({ width: thumbnailWidth })
            .toBuffer();
        res.set("Content-Type", "image/png");
        return res.send(thumbnail); // ✅ return here
    }
    catch (err) {
        console.error("Thumbnail generation error:", err);
        return res.status(500).json({ error: "Thumbnail generation failed" });
    }
    finally {
        if (browser)
            await browser.close();
    }
});
app.listen(port, () => {
    console.log(`Thumbnail service running at http://localhost:${port}`);
});



///////////////////

// Read Kafka config from properties file
function readConfig(fileName) {
    const data = fs.readFileSync(fileName, "utf8").toString().split("\n");
    return data.reduce((config, line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            config[key] = value;
        }
        return config;
    }, {});
}

// Producer logic
async function produce(topic, config) {
    const key = "key";
    const value = "value";

    // create a new producer instance
    const producer = new Kafka().producer(config);

    // connect the producer to the broker
    await producer.connect();

    // send a single message
    const produceRecord = await producer.send({
        topic,
        messages: [{ key, value }],
    });
    console.log(
        `\n\n Produced message to topic ${topic}: key = ${key}, value = ${value}, ${JSON.stringify(
            produceRecord,
            null,
            2
        )} \n\n`
    );

    // disconnect the producer
    await producer.disconnect();
}

async function consume(topic, config) {
    // setup graceful shutdown
    const disconnect = () => {
        consumer.commitOffsets().finally(() => {
            consumer.disconnect();
        });
    };
    process.on("SIGTERM", disconnect);
    process.on("SIGINT", disconnect);

    // set the consumer's group ID, offset and initialize it
    config["group.id"] = "nodejs-group-1";
    config["auto.offset.reset"] = "earliest";
    const consumer = new Kafka().consumer(config);

    // connect the consumer to the broker
    await consumer.connect();

    // subscribe to the topic
    await consumer.subscribe({ topics: [topic] });

    // consume messages from the topic
    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(
                `Consumed message from topic ${topic}, partition ${partition}: key = ${message.key.toString()}, value = ${message.value.toString()}`
            );
        },
    });
}
// Main entry
async function main() {
    const config = readConfig("client.properties");
    
    const topic = "thumbnail_data";

    await produce(topic, config);
    //await consume(topic, config);
}

// main().catch((err) => {
//     console.error("❌ Error in Kafka client:", err);
// });

