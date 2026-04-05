import { getBucketPolicy } from "@/lib/s3-gateway/s3-bucket-controls"

type PolicyStatement = {
    Effect: "Allow" | "Deny"
    Action: string | string[]
    Resource: string | string[]
    Principal?: "*" | { AWS?: string | string[] } | string
}

type PolicyDocument = {
    Statement?: PolicyStatement | PolicyStatement[]
}

function toArray( value: string | string[] ): string[] {
    return Array.isArray( value ) ? value : [value]
}

function actionMatches( action: string, pattern: string ): boolean {
    if ( pattern === "*" || pattern === "s3:*" ) {
        return true
    }
    if ( !pattern.includes( "*" ) ) {
        return pattern === action
    }
    const regex = new RegExp( `^${pattern.replaceAll( "*", ".*" )}$` )
    return regex.test( action )
}

function resourceMatches( resource: string, pattern: string ): boolean {
    if ( pattern === "*" ) {
        return true
    }
    if ( !pattern.includes( "*" ) ) {
        return pattern === resource
    }
    const regex = new RegExp( `^${pattern.replaceAll( "*", ".*" )}$` )
    return regex.test( resource )
}

function principalMatches( statement: PolicyStatement, accessKeyId: string | null ): boolean {
    if ( !statement.Principal || statement.Principal === "*" ) {
        return true
    }
    if ( !accessKeyId ) {
        return false
    }
    if ( typeof statement.Principal === "string" ) {
        return statement.Principal === accessKeyId
    }
    const aws = statement.Principal.AWS
    if ( !aws ) {
        return false
    }
    const principals = Array.isArray( aws ) ? aws : [aws]
    return principals.includes( accessKeyId ) || principals.includes( "*" )
}

export async function evaluateBucketPolicy(
    bucketId: string,
    accessKeyId: string | null,
    action: string,
    resource: string,
): Promise<"allow" | "deny" | "no-match"> {
    const policy = await getBucketPolicy( bucketId )
    if ( !policy ) {
        return "no-match"
    }

    let parsed: PolicyDocument
    try {
        parsed = JSON.parse( policy.policyJson ) as PolicyDocument
    } catch {
        return "deny"
    }

    const statementsRaw = parsed.Statement
    if ( !statementsRaw ) {
        return "no-match"
    }
    const statements = Array.isArray( statementsRaw ) ? statementsRaw : [statementsRaw]

    let matchedAllow = false
    for ( const statement of statements ) {
        if ( !principalMatches( statement, accessKeyId ) ) {
            continue
        }
        const actionOk = toArray( statement.Action ).some( ( candidate ) => actionMatches( action, candidate ) )
        if ( !actionOk ) {
            continue
        }
        const resourceOk = toArray( statement.Resource ).some( ( candidate ) => resourceMatches( resource, candidate ) )
        if ( !resourceOk ) {
            continue
        }

        if ( statement.Effect === "Deny" ) {
            return "deny"
        }
        matchedAllow = true
    }

    return matchedAllow ? "allow" : "no-match"
}
