import { ChatGPTProvider } from "./chat-gpt.provider";
import { MongoProvider } from "./mongo-provider";
import uniqueArtwork from './data/unique-artwork-20240304100235.json';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function seed() {
    const artwork = (uniqueArtwork as any)["cards"];

    // const artwork = fetch("https://data.scryfall.io/unique-artwork/unique-artwork-20240304220243.json"); ?

    const mongo = new MongoProvider();
    await mongo.init();
    await mongo.client.db('card_art').collection('mtg').insertMany(artwork);
}

async function enhance() {
    const mongo = new MongoProvider();
    await mongo.init();

    const artCursor = mongo.client.db('card_art').collection('mtg').find({
        description: { $exists: false },
        set_type: 'expansion',
        'image_uris.art_crop': { $exists: true }
    }).sort({ released_at: -1 });

    const chatGPT = new ChatGPTProvider();

    let count = 0;

    while (artCursor.hasNext()) {
        const art = await artCursor.next();
        if (!art) {
            throw new Error('Could not get next doc from cursor!')
        }

        const crop = art.image_uris.art_crop;
        console.table({ 
            name: art.name, 
            id: `ObjectId(${art._id.toHexString()})`,
            img: crop,
            set_name: art.set_name
        });
        const description = await chatGPT.getImageDescription(crop);
        if (!description) {
            console.error('Could not get description', art._id.toString(), art.name, crop)
        } else {
            await mongo.client.db('card_art').collection('mtg').updateOne({ _id: art._id }, { $set: { description } });
            count++;
        }
        console.log(description);

        if (count % 50 === 0) {
            console.log(`${count} enhanced with descriptions.`)
            delay(2000)
        }
    }

    await artCursor.close();
}

// seed().catch(console.dir);
enhance().catch(console.dir);