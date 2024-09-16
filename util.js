// it is what it is

export const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export async function sign(text) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(process.env.SIGNING_SECRET), {
            name: "HMAC",
            hash: {name: "SHA-256"}
        },
        false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(text));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function redirect(url, additional_headers = {}) {
    return new Response(null, {
        status: 301,
        headers: {
            Location: url,
            ...additional_headers
        }
    });
}

export function redirect_error(error_text) {
    return redirect(`/?error=${encodeURIComponent(error_text)}`)
}

export async function gen_shipments_url(email, show_ids) {
    let params = {
        email,
        signature: await sign(email),
    }
    if (show_ids) params.show_ids = "yep"
    return `${process.env.BASE_URL}/shipments?${new URLSearchParams(params).toString()}`
}