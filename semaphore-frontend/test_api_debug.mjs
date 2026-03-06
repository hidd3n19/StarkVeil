
async function run() {
    const passphrase = "TestPassphrase123!";

    // 1. Create Identity
    const createRes = await fetch("http://localhost:8787/api/identities/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase })
    });
    const identity = await createRes.json();
    console.log("Created Identity:", identity.id);

    // 2. Mock Reputation to pass starknet-devs policy
    await fetch("http://localhost:8787/api/identities/attrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_id: identity.id, reputation: 100, token_balance: 1000 })
    });
    console.log("Mocked attributes.");

    // 3. Join Group
    const joinRes = await fetch("http://localhost:8787/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: "starknet-devs", identity_id: identity.id })
    });
    let group;
    try {
        group = await joinRes.json();
        console.log("Joined Group:", group.id || group);
    } catch (e) {
        console.log("Join output raw:", await joinRes.text());
    }

    // 4. Generate Proof
    const proofPayload = {
        group_id: "starknet-devs",
        identity_id: identity.id,
        passphrase: passphrase,
        scope: "starknet-devs:Best wallet 2026?",
        message: "ArgentX"
    };

    try {
        const res = await fetch("http://localhost:8787/api/proofs/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(proofPayload)
        });
        console.log("Generate Proof Status:", res.status);
        const data = await res.json();
        console.log("Proof Response:", data);
    } catch (e) {
        console.error(e);
    }
}
run();
