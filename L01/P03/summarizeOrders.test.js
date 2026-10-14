const test = require("node:test");
const assert = require("node:assert/strict");

const { summarizeOrders } = require("./summarizeOrders");

// Test 1: Correct revenue, status counts, and top customers
test("should summarize orders correctly", () => {
    const orders = [
        {
            customer: "Rahul",
            status: "paid",
            items: [
                { price: 100, qty: 2 },
                { price: 50, qty: 1 }
            ]
        },
        {
            customer: "Aman",
            status: "shipped",
            items: [
                { price: 200, qty: 1 }
            ]
        },
        {
            customer: "Rahul",
            status: "pending",
            items: [
                { price: 500, qty: 1 }
            ]
        }
    ];

    const result = summarizeOrders(orders);

    assert.deepStrictEqual(result, {
        totalRevenue: 450,
        ordersByStatus: {
            paid: 1,
            shipped: 1,
            pending: 1
        },
        topCustomers: [
            { customer: "Rahul", spend: 250 },
            { customer: "Aman", spend: 200 }
        ]
    });
});

// Test 2: Empty orders array
test("should handle an empty orders array", () => {
    const result = summarizeOrders([]);

    assert.deepStrictEqual(result, {
        totalRevenue: 0,
        ordersByStatus: {},
        topCustomers: []
    });
});

// Test 3: Invalid input
test("should throw TypeError when orders is not an array", () => {
    assert.throws(
        () => summarizeOrders("invalid"),
        TypeError
    );
});

// Test 4: Missing items should be treated as an empty array
test("should handle orders with missing items", () => {
    const orders = [
        {
            customer: "Rahul",
            status: "paid"
        }
    ];

    const result = summarizeOrders(orders);

    assert.equal(result.totalRevenue, 0);
    assert.deepStrictEqual(result.ordersByStatus, {
        paid: 1
    });
    assert.deepStrictEqual(result.topCustomers, [
        { customer: "Rahul", spend: 0 }
    ]);
});

// Test 5: Missing price and quantity should be treated as zero
test("should treat missing price and quantity as zero", () => {
    const orders = [
        {
            customer: "Rahul",
            status: "paid",
            items: [
                { qty: 2 },
                { price: 100 }
            ]
        }
    ];

    const result = summarizeOrders(orders);

    assert.equal(result.totalRevenue, 0);
    assert.deepStrictEqual(result.topCustomers, [
        { customer: "Rahul", spend: 0 }
    ]);
});

// Test 6: Unknown statuses should be counted but excluded from revenue
test("should count unknown statuses without including their revenue", () => {
    const orders = [
        {
            customer: "Rahul",
            status: "paid",
            items: [{ price: 100, qty: 1 }]
        },
        {
            customer: "Aman",
            status: "cancelled",
            items: [{ price: 500, qty: 1 }]
        }
    ];

    const result = summarizeOrders(orders);

    assert.equal(result.totalRevenue, 100);

    assert.deepStrictEqual(result.ordersByStatus, {
        paid: 1,
        cancelled: 1
    });

    assert.deepStrictEqual(result.topCustomers, [
        { customer: "Rahul", spend: 100 }
    ]);
});

// Test 7: Only the top three customers should be returned
test("should return only the top three customers", () => {
    const orders = [
        {
            customer: "A",
            status: "paid",
            items: [{ price: 100, qty: 1 }]
        },
        {
            customer: "B",
            status: "paid",
            items: [{ price: 300, qty: 1 }]
        },
        {
            customer: "C",
            status: "paid",
            items: [{ price: 200, qty: 1 }]
        },
        {
            customer: "D",
            status: "paid",
            items: [{ price: 400, qty: 1 }]
        }
    ];

    const result = summarizeOrders(orders);

    assert.deepStrictEqual(result.topCustomers, [
        { customer: "D", spend: 400 },
        { customer: "B", spend: 300 },
        { customer: "C", spend: 200 }
    ]);
});

// Test 8: Equal spending should be sorted alphabetically
test("should sort customers alphabetically when spending is equal", () => {
    const orders = [
        {
            customer: "Rahul",
            status: "paid",
            items: [{ price: 100, qty: 1 }]
        },
        {
            customer: "Aman",
            status: "paid",
            items: [{ price: 100, qty: 1 }]
        },
        {
            customer: "Priya",
            status: "paid",
            items: [{ price: 100, qty: 1 }]
        }
    ];

    const result = summarizeOrders(orders);

    assert.deepStrictEqual(result.topCustomers, [
        { customer: "Aman", spend: 100 },
        { customer: "Priya", spend: 100 },
        { customer: "Rahul", spend: 100 }
    ]);
});

// Test 9: Decimal prices should be handled using integer cents
test("should handle decimal prices correctly", () => {
    const orders = [
        {
            customer: "Rahul",
            status: "paid",
            items: [
                { price: 10.25, qty: 2 },
                { price: 5.50, qty: 1 }
            ]
        }
    ];

    const result = summarizeOrders(orders);

    assert.equal(result.totalRevenue, 26);
    assert.deepStrictEqual(result.topCustomers, [
        { customer: "Rahul", spend: 26 }
    ]);
});

// Test 10: Multiple orders from the same customer should be combined
test("should combine spending from multiple eligible orders", () => {
    const orders = [
        {
            customer: "Rahul",
            status: "paid",
            items: [{ price: 100, qty: 1 }]
        },
        {
            customer: "Rahul",
            status: "shipped",
            items: [{ price: 200, qty: 1 }]
        },
        {
            customer: "Rahul",
            status: "pending",
            items: [{ price: 500, qty: 1 }]
        }
    ];

    const result = summarizeOrders(orders);

    assert.equal(result.totalRevenue, 300);
    assert.deepStrictEqual(result.topCustomers, [
        { customer: "Rahul", spend: 300 }
    ]);
});