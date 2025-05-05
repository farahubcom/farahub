const { Doc, Injection } = require("@farahub/framework/facades");

const hooks = module => ({
    'Products': {
        'main.list.search': async ({ req, user }) => {
            const args = req.query;

            if (args && args.labels) {
                const Label = req.wsConnection.model('Label');
                const label = typeof args.labels == "string" ?
                    await Doc.resolveByIdentifier(args.labels, Label) :
                    await Doc.resolve(args.labels, Label);
                return label?.id ? { labels: label?.id } : { _id: null };
            }

            return {}
        },
        'main.list.populate': async () => {
            return {
                path: 'labels',
                select: 'name'
            }
        },
        'main.createOrUpdate.validate': async () => {
            return {
                labels: {
                    in: ["body"],
                    optional: true,
                    isArray: true,
                },
                'labels.*': {
                    in: ["body"],
                    custom: {
                        options: (value, { req }) => {
                            const Label = req.wsConnection.model('Label');

                            if (typeof value === 'string') {
                                return Doc.resolveByIdentifier(value, Label).then(label => {
                                    if (!label) {
                                        if (!Object.keys(module.app.labels).includes(value)) {
                                            return Promise.reject('برچسب نامعتبر است');
                                        }
                                    }

                                    return Promise.resolve(true);
                                })
                            }

                            return Doc.resolve(value, Label).then(label => {
                                if (!label) {
                                    return Promise.reject(false);
                                }

                                return Promise.resolve(true);
                            })
                        },
                        bail: true
                    },
                }
            }
        },
        'main.details.populate': async () => {
            return {
                path: 'labels',
                select: 'name'
            }
        },
        'main.createOrUpdate.preSave': async ({ req, data, connection, inject, product }) => {
            const Label = req.wsConnection.model('Label');

            product.labels = (await Promise.all(
                (data.labels || [])?.filter(Boolean)?.map(
                    async label => {
                        if (typeof label === "string") {
                            const labelDoc = await Doc.resolveByIdentifier(label, Label);

                            if (labelDoc) {
                                label = labelDoc;
                            } else if (Object.keys(module.app.labels).includes(label)) {
                                label = await Label.createOrUpdate(
                                    {
                                        identifier: toLower(label),
                                        ...module.app.labels[label],
                                    },
                                    null,
                                    {
                                        connection,
                                        inject: Injection.register(module.app.module('Labels'), 'main.createOrUpdate', { withRequest: false })
                                    }
                                )
                            }
                        } else {
                            label = await Doc.resolve(label, Label);
                        }

                        return label?.id;
                    }
                )
            )).filter(Boolean);
        },
    }
})

module.exports = hooks;