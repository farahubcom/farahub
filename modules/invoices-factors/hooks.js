const hooks = module => ({
    'invoices': {
        'main.createOrUpdate.preSave': async ({ invoice, data }) => {
            // assign factors
            if (data.factors) {
                invoice.factors = data.factors.map(
                    factor => pick(factor, [
                        'title',
                        'type',
                        'amount',
                        'unit'
                    ])
                )
            }
        }
    }
})

module.exports = hooks;