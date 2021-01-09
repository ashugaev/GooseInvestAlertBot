import {prop, getModelForClass} from '@typegoose/typegoose'

export class Alias {
    @prop({required: true})
    title: string

    @prop({required: true})
    symbol: string

    @prop({required: true})
    user: number
}

export interface AliasItem extends Alias {
    _id: string
}

export interface RemoveAliasParams {
    title?: string,
    user?: number,
    _id?: string
}

export interface GetAliasParams {
    title?: string,
    user?: number
}

// Get User model
const AliasModel = getModelForClass(Alias, {
    schemaOptions: {timestamps: true},
})

// Get or create user
export function createAlias({title, symbol, user}: Alias): Promise<null> {
    return new Promise(async (rs, rj) => {
        try {
            await AliasModel.create({user, symbol: symbol.toUpperCase(), title} as Alias);

            rs();
        } catch (e) {
            rj(e)
        }
    })
}

export function getAlias({title, user}: GetAliasParams | null = {}): Promise<AliasItem[]> {
    return new Promise(async (rs, rj) => {
        try {
            const params: GetAliasParams = {};

            title && (params.title = title)
            user && (params.user = user)

            const alerts = await AliasModel.find(params)

            rs(alerts);
        } catch (e) {
            rj(e);
        }
    })
}

export function aliasRemove({title, user, _id}: RemoveAliasParams): Promise<number> {
    return new Promise(async (rs, rj) => {
        try {
            const params: RemoveAliasParams = {};

            title && (params.title = title)
            user && (params.user = user)
            _id && (params._id = _id)

            if (!Object.values(params).length) {
                rj('Недостаточно данных для удаления')
                return;
            }

            const {deletedCount} = await AliasModel.deleteMany(params)

            rs(deletedCount);
        } catch (e) {
            rj(e);
        }
    })
}

interface GetAliasesCountForUserParams {
    user: number
}

export const getAliasesCountForUser = (user: number) => new Promise(async (rs, rj) => {
    try {
        const params: GetAliasesCountForUserParams = {user};
        const aliasesCount = await AliasModel.find(params).count()

        rs(aliasesCount);
    } catch (e) {
        rj(e)
    }
})
