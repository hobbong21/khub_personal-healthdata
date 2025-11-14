"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "patient";
    UserRole["HEALTHCARE_PROVIDER"] = "healthcare_provider";
    UserRole["RESEARCHER"] = "researcher";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["READ_OWN_DATA"] = "read_own_data";
    Permission["WRITE_OWN_DATA"] = "write_own_data";
    Permission["READ_PATIENT_DATA"] = "read_patient_data";
    Permission["WRITE_PATIENT_DATA"] = "write_patient_data";
    Permission["ACCESS_ANONYMIZED_DATA"] = "access_anonymized_data";
    Permission["MANAGE_USERS"] = "manage_users";
    Permission["SYSTEM_ADMIN"] = "system_admin";
})(Permission || (exports.Permission = Permission = {}));
exports.default = {};
//# sourceMappingURL=security.js.map