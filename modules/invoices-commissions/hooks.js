const { Doc } = require("@farahub/framework/facades");

const hooks = module => ({
    'invoices': {
        'main.list.populate.item': async () => {
            return { path: 'member' }
        },
        'main.createOrUpdate.validate': async () => {
            return {
                'items.*.member': {
                    in: ["body"],
                    optional: true,
                    custom: {
                        options: (value, { req, path }) => {
                            const Person = req.wsConnection.model('Person');
                            const commissonPath = path.replace('member', 'commissonPercent');
                            const commissonValue = req.body[commissonPath];

                            // If commissonPercent is provided, member is required
                            if (commissonValue && !value) {
                                return Promise.reject('عضو اجباری می باشد وقتی پورسانت ارائه شده است.');
                            }

                            // If member is provided, validate it exists
                            if (value) {
                                return Doc.resolve(value, Person).then(person => {
                                    if (!person) {
                                        return Promise.reject('کارمند در یک ردیف فاکتور یافت نشد.');
                                    }
                                    return Promise.resolve(true);
                                });
                            }

                            return Promise.resolve(true);
                        },
                        bail: true
                    },
                },
                'items.*.commissonPercent': {
                    in: ["body"],
                    isInt: {
                        options: { min: 1, max: 100 },
                        errorMessage: "پورسانت در هر ردیف فاکتور باید بین 1 تا 100 باشد."
                    },
                    toInt: true,
                    optional: true,
                    custom: {
                        options: (value, { req, path }) => {
                            const memberPath = path.replace('commissonPercent', 'member');
                            const memberValue = req.body[memberPath];

                            // If member is provided, commissonPercent is required
                            if (memberValue && !Boolean(value)) {
                                return Promise.reject('پورسانت در هر ردیف فاکتور اجباری می باشد.');
                            }

                            return Promise.resolve(true);
                        }
                    }
                },
                items: {
                    custom: {
                        options: (value, { req }) => {
                            if (!req.body.items) return Promise.resolve(true);

                            // Calculate total commission
                            const totalCommission = req.body.items.reduce((sum, item) => {
                                return sum + (item.commissonPercent || 0);
                            }, 0);

                            if (totalCommission > 100) {
                                return Promise.reject('مجموع پورسانت‌ها نمی‌تواند بیشتر از ۱۰۰ باشد.');
                            }

                            return Promise.resolve(true);
                        }
                    }
                }
            }
        },
        'main.details.populate': async () => {
            return {
                path: 'roles',
                select: 'name'
            }
        },
        'main.createOrUpdate.itemPreSave': async ({ item, data, itemId, connection }) => {
            if (data.member) {
                const Person = connection.model('Person');
                const person = await Doc.resolve(data.member, Person);
                item.member = person.id;
                item.commissonPercent = data.commissonPercent;
            }
        }
    }
})

module.exports = hooks;