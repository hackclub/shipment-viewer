import {gen_shipments_url, redirect, redirect_error, EMAIL_REGEX} from "../util.js";
import {LoopsClient} from "loops";
// sorry
export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST' || req.headers.get('content-type') !== 'application/x-www-form-urlencoded') return redirect("/", {"x-what": "huh?"})

    const form = await req.formData()
    const email = form.get('email"')
    const internal = form.get('internal')
    console.log(email)
    console.log(internal)
    if (internal && internal !== process.env.INTERNAL_KEY) return redirect(process.env.NOPE_URL)

    if (email === "dinobox@hackclub.com") return redirect_error("that is not your email :3")
    // huh??
    if (!email) return redirect_error("...missing email?")

    if (!EMAIL_REGEX.test(email)) return redirect_error("email isn't shaped right ¯\\_(ツ)_/¯")

    try {
        const apiUrl = `https://api.airtable.com/v0/${process.env.MSR_BASE}/${process.env.MSR_TABLE}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Email}="${email}"`)}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`, // Bearer token or other credentials
                'Content-Type': 'application/json',
            },
        });
        // no such email:
        if (!(await response.json()).records.length) return redirect("/?tryAgain=yeah")

    } catch (e) {
        console.error(e, e.stack)
        return redirect_error(`error checking for shipments from that email!<br/>request ID: ${req.headers.get('x-vercel-id')}`)
    }
    if (internal) return redirect(gen_shipments_url(email, true))
    try {
        console.log("looping")
        const loops = new LoopsClient(process.env.LOOPS_API_KEY);
        await loops.sendTransactionalEmail({
            transactionalId: process.env.TRANSACTIONAL_ID,
            email: email,
            dataVariables: {
                link: await gen_shipments_url(email)
            }
        });
    } catch (e) {
        console.error(e, e.stack)
        return redirect_error(`error sending email!<br/>request ID: ${req.headers.get('x-vercel-id')}`)
    }
    return redirect("/check-your-email")
}
