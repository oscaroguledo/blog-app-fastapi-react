"""API tests for /contact endpoint."""


async def test_submit_contact(client):
    resp = await client.post("/contact/", json={
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Hello",
        "message": "This is a test message."
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True
