import MongooseDAO from "../model/dao.js";
import CredentialsService from "./credentials.js";
import MailboxService from "./mailbox.js";

const dao = new MongooseDAO();

export const credentialsService = new CredentialsService( dao );
export const mailboxService = new MailboxService();
