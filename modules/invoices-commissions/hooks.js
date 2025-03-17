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
                    // isMongoId: {
                    //     bail: true,
                    //     errorMessage: 'شخص نامعتبر میباشد.'
                    // },
                    custom: {
                        options: (value, { req }) => {
                            const Person = req.wsConnection.model('Person');
                            return Doc.resolve(value, Person).then(person => {
                                if (!person)
                                    return Promise.reject('شخص یافت نشد.');
                                return Promise.resolve(true);
                            })
                        },
                        bail: true
                    },
                    // customSanitizer: {
                    //     options: (value, { req }) => {
                    //         return ObjectId(value);
                    //     }
                    // }
                },
                'items.*.commissonPercent': {
                    in: ["body"],
                    isInt: true,
                    toInt: true,
                    errorMessage: "پورسانت اجباری می باشد.",
                    optional: true,
                    custom: {
                        options: (value, { req, path }) => {
                            const memberPath = path.replace('commissonPercent', 'member');
                            const memberValue = req.body[memberPath];
                            
                            // If member is provided, commissonPercent is required
                            if (memberValue && value === undefined) {
                                throw new Error('پورسانت اجباری می باشد.');
                            }
                            return true;
                        }
                    }
                },
            }
        },
        'main.details.populate': async () => {
            return {
                path: 'roles',
                select: 'name'
            }
        },
        'main.createOrUpdate.itemPreSave': async ({ item, data, itemId, connection }) => {
            console.log({item, data});
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