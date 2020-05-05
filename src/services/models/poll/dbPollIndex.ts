import { PollStatus } from "./PollStatus";
import { Model, ModelAttributes, ModelOptions } from "sequelize";
import sequelize = require("sequelize");

export default class dbPollIndex extends Model implements PollStatus {

    id: number;
    PollWaxed: boolean;
    PollStarted: boolean;
    PollStopped: boolean;
    DistributionStarted: boolean;
    DistributionCompleted: boolean;
    InDistribution: boolean;
    StatisticsOfDistributionJson: string;
    created_at:Date;
    updated_at:Date;

    start() {
        this.PollStarted = true;
        return this;
    }
    stop() {
        this.PollStopped = true;
        return this;

    }
    restart() {
        this.PollStopped = false;
        return this;

    }
    startDistribution() {
        this.DistributionStarted = true;
        return this;
    }
    setDistributionAsCompleted() {
        this.DistributionCompleted = true;
        return this;
    }
    wax() {
        this.PollWaxed = true;
        return this;

    }
}

const name = 'Polls';
const attributes: ModelAttributes = {
    PollWaxed: {
        type: sequelize.BOOLEAN
    },
    PollStarted: {
        type: sequelize.BOOLEAN
    },
    PollStopped: {
        type: sequelize.BOOLEAN
    },
    InDistribution: {
        type: sequelize.BOOLEAN
    },
    DistributionCompleted: {
        type: sequelize.BOOLEAN
    },
    DistributionStarted: {
        type: sequelize.BOOLEAN
    },
    StatisticsOfDistributionJson: {
        type: sequelize.TEXT
    },
    created_at: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    updated_at: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    }
}

const options: ModelOptions = {
    freezeTableName: true
}

export const PollIndexDefiner = { name, attributes, options }