import {redirect, gen_shipments_url, EMAIL_REGEX} from "../util.js";

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') return redirect(process.env.BASE_URL)

    if (!process.env.PRESIGNING_KEYS.split(',').includes(req.headers.get('authorization')))
        return new Response(null, {
            status: 301,
            headers:
                {
                    Location: process.env.NOPE_URL,
                    "x-nice-try": "lol"
                }
        });

    const email = await req.text()
    if(!email || !EMAIL_REGEX.test(email)) return new Response(':-/', {status: 400})

    return new Response(await gen_shipments_url(email), {
        status: 200,
    });
}
