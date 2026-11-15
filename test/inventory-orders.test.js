const test = require('node:test');
const assert = require('node:assert/strict');

const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

test('selling exactly the remaining sellable stock succeeds', () => {
  const products = [
    { id: 1, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', stock: 1, reserved: 0 },
    { id: 2, sku: 'SPC-001', name: 'Byadgi Chilli Powder', stock: 4, reserved: 3 }
  ];

  assert.equal(inventory.getSellableStock(products[0]), 1);
  const gheeOrder = [{ id: 1, qty: 1 }];
  assert.deepEqual(inventory.check(products, gheeOrder), { ok: true });
  inventory.reserve(products, gheeOrder);
  assert.equal(products[0].stock, 0);

  assert.equal(inventory.getSellableStock(products[1]), 1);
  const chilliOrder = [{ id: 2, qty: 1 }];
  assert.deepEqual(inventory.check(products, chilliOrder), { ok: true });
  inventory.reserve(products, chilliOrder);
  assert.equal(products[1].stock, 3);
  assert.equal(inventory.getSellableStock(products[1]), 0);
});

test('cancelling an order restores its physical stock', () => {
  const db = {
    products: [{ id: 1, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', stock: 0, reserved: 0 }],
    orders: [{
      id: 1007,
      status: 'pending',
      paymentMode: 'cash',
      items: [{ id: 1, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', qty: 1 }]
    }]
  };

  const result = orders.cancel(db, 1007, 'Cancelled from order desk');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(db.products[0].stock, 1);
  assert.equal(db.products[0].reserved, 0);
});
