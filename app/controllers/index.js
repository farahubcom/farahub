const MainController = require("./MainController");
const WorkspacesController = require("./WorkspacesController");
const ModulesController = require("./ModulesController");
const AuthenticatedController = require("./AuthenticatedController");
const MembershipController = require("./MembershipController");
const WorkspaceController = require("./WorkspaceController");


const controllers = [
    MainController,
    WorkspacesController,
    ModulesController,
    AuthenticatedController,
    MembershipController,
    WorkspaceController,
];

module.exports = controllers;