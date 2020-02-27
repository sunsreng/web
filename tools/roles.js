const program = require("commander");
const admin = require("firebase-admin");
const Table = require("cli-table");

const package = require("../package");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: package.config.firebase.databaseUrl
});

const auth = admin.auth();

program.name("roles");

program.option(
  "-e, --email",
  "uses an e-mail address instead of a uid, i.e. replaces <uid> with <email>"
);

program
  .command("get <uid>")
  .alias("read")
  .description("gets the roles for a user, available through custom claims")
  .action(uid => {
    if (program.email) {
      const email = uid;

      auth
        .getUserByEmail(email)
        .then(value => {
          if (!value) {
            console.log("The user doesn’t have any data.");
            process.exit(1);
          }

          const customClaims = value.customClaims;

          if (!customClaims) {
            console.log("The user doesn’t have any custom claims.");
            process.exit(1);
          }

          const roles = customClaims.roles;

          if (!roles) {
            console.log("The user doesn’t have any roles.");
            process.exit(1);
          }

          const table = new Table();

          table.push({ roles: roles });

          console.log(table.toString());
          process.exit(0);
        })
        .catch(reason => {
          console.log(reason.message);
          process.exit(1);
        });

      return;
    }

    auth
      .getUser(uid)
      .then(value => {
        if (!value) {
          console.log("The user doesn’t have any data.");
          process.exit(1);
        }

        const customClaims = value.customClaims;

        if (!customClaims) {
          console.log("The user doesn’t have any custom claims.");
          process.exit(1);
        }

        const roles = customClaims.roles;

        if (!roles) {
          console.log("The user doesn’t have any roles.");
          process.exit(1);
        }

        const table = new Table();

        table.push({ roles: roles });

        console.log(table.toString());
        process.exit(0);
      })
      .catch(reason => {
        console.log(reason.message);
        process.exit(1);
      });
  });

program
  .command("set <uid> <roles>")
  .alias("update")
  .description("sets the roles for a user, will overwrite any existing roles")
  .action((uid, roles) => {
    roles = roles.split(",");

    if (program.email) {
      const email = uid;

      auth
        .getUserByEmail(email)
        .then(value => {
          if (!value) {
            console.log("The user doesn’t have any data.");
            process.exit(1);
          }

          const uid = value.uid;

          if (!uid) {
            console.log("The user doesn’t have a UID.");
            process.exit(1);
          }

          auth
            .setCustomUserClaims(uid, { roles: roles })
            .then(() => {
              const table = new Table();

              table.push({ uid: uid }, { email: email }, { roles: roles });

              console.log(table.toString());
              process.exit(0);
            })
            .catch(reason => {
              console.log(reason.message);
              process.exit(1);
            });
        })
        .catch(reason => {
          console.log(reason.message);
          process.exit(1);
        });

      return;
    }

    auth
      .setCustomUserClaims(uid, { roles: roles })
      .then(() => {
        const table = new Table();

        table.push({ uid: uid }, { roles: roles });

        console.log(table.toString());
        process.exit(0);
      })
      .catch(reason => {
        console.log(reason.message);
        process.exit(1);
      });
  });

program
  .command("remove <uid>")
  .alias("delete")
  .description("removes all roles from a user, a clean slate")
  .action(uid => {
    if (program.email) {
      const email = uid;

      auth
        .getUserByEmail(email)
        .then(value => {
          if (!value) {
            console.log("The user doesn’t have any data.");
            process.exit(1);
          }

          const uid = value.uid;

          if (!uid) {
            console.log("The user doesn’t have a UID.");
            process.exit(1);
          }

          auth
            .setCustomUserClaims(uid, { roles: null })
            .then(() => {
              console.log("All roles removed from user");
              process.exit(0);
            })
            .catch(reason => {
              console.log(reason.message);
              process.exit(1);
            });
        })
        .catch(reason => {
          console.log(reason.message);
          process.exit(1);
        });

      return;
    }

    auth
      .setCustomUserClaims(uid, { roles: null })
      .then(() => {
        console.log("All roles removed from user");
        process.exit(0);
      })
      .catch(reason => {
        console.log(reason.message);
        process.exit(1);
      });
  });

program.parse(process.argv);