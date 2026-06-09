import assert from "node:assert/strict";
import test from "node:test";

function balance({ startingBankroll, bets }) {
  return Number(
    bets
      .reduce((sum, bet) => {
        const payout = bet.status === "pending" ? 0 : bet.payout;
        return sum - bet.stake + payout;
      }, startingBankroll)
      .toFixed(2)
  );
}

function pendingPotential(bets) {
  return Number(
    bets
      .filter((bet) => bet.status === "pending")
      .reduce((sum, bet) => sum + bet.stake * bet.odds, 0)
      .toFixed(2)
  );
}

test("won bet matches Excel payout-including-stake formula", () => {
  const currentBalance = balance({
    startingBankroll: 100,
    bets: [{ stake: 20, odds: 1.74, status: "won", payout: 34.8 }]
  });

  assert.equal(currentBalance, 114.8);
});

test("lost bet deducts stake and pays out zero", () => {
  const currentBalance = balance({
    startingBankroll: 100,
    bets: [{ stake: 20, odds: 1.74, status: "lost", payout: 0 }]
  });

  assert.equal(currentBalance, 80);
});

test("pending bet keeps stake deducted and adds possible payout separately", () => {
  const bets = [{ stake: 20, odds: 2.5, status: "pending", payout: 0 }];
  const currentBalance = balance({ startingBankroll: 100, bets });
  const potentialPayout = pendingPotential(bets);

  assert.equal(currentBalance, 80);
  assert.equal(potentialPayout, 50);
  assert.equal(currentBalance + potentialPayout, 130);
});
