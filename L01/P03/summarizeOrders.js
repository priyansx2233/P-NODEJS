//summarizeOrders naam ka function jo order array leta hai 
function summarizeOrders(orders) {
    if (!Array.isArray(orders)) { 
        throw new TypeError("orders must be an array"); //agar order array nhi hoga to error aayega
    }

    const eligibleStatuses = ["paid", "shipped"]; // do states eligibble hai 

    const processedOrders = orders.map(order => { 
        const totalCents = (order.items ?? []).reduce((sum, item) => { //agar orders array ke andar koi items nhi hai to empty array use krna hai 
            const price = item.price ?? 0;  // agar current item ki price nhi given hai to 0 hogi 
            const qty = item.qty ?? 0;      //same isme bhi hoga

            return sum + Math.round(price * 100) * qty; //ye cents mai calculate krrha hai 
        }, 0);

        return { //fir ye processed array ya object return krega jiska naam processedOrders hoga
            customer: order.customer, 
            status: order.status,
            totalCents
        };
    });


    const ordersByStatus = processedOrders.reduce((counts, order) => { // ye shipped , cancelled wagera ka object bnadega uske counting ke hisaab se 
        counts[order.status] = (counts[order.status] ?? 0) + 1;
        return counts;
    }, {});

    // Only paid and shipped orders contribute to revenue and customer spend.
    const eligibleOrders = processedOrders.filter(order =>
        eligibleStatuses.includes(order.status) //agar order ka status eligible hai to vo eligibleOrder array bn jayega
    );

    const totalRevenueCents = eligibleOrders.reduce( //total revenue cents mai aagya 
        (total, order) => total + order.totalCents,
        0
    );
    const customerSpend = eligibleOrders.reduce((spending, order) => { //customer wise total spending nikal defa
        spending[order.customer] =
            (spending[order.customer] ?? 0) + order.totalCents;

        return spending;
    }, {});

    const topCustomers = Object.entries(customerSpend) //customer descending spending krega
        .map(([customer, spendCents]) => ({
            customer,
            spendCents
        }))
        .sort((a, b) =>
            b.spendCents - a.spendCents ||
            a.customer.localeCompare(b.customer)
        )
        .slice(0, 3)
        .map(({ customer, spendCents }) => ({
            customer,
            spend: spendCents / 100
        }));

    return {
        totalRevenue: totalRevenueCents / 100,
        ordersByStatus,
        topCustomers
    };
}

module.exports = { summarizeOrders };

// map() — har order ko process karna.
// reduce() — totals aur customer-wise spending calculate karna.
// filter() — revenue ke liye eligible orders select karna.
// sort() — customers ki ranking banana.