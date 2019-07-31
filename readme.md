# event-sourcing-example

Event sourcing example in Node.js using [eventstore](https://eventstore.js.org/)

## Running the app

```sh
# install dependencies
npm install

# run the app
npm run dev
```

## Endpoints

### GET /users/:userId

We only have two user ids: `user-1` and `user-2` (using in-memory store).
This endpoint to get particular user data, with balance info included

### POST /transactions

This endpoint used to simulate user transaction. Request payload example:
```javascript
{
  "userID": "user-2", // user's id. user-1 or user-2
  "amount": 2500,     // amount of transaction
  "type": "deposit"   // use `deposit` to add balance, use `redeem` to reduce balance
}
```
