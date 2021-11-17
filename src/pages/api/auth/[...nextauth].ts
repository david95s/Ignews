import { query as q } from 'faunadb';
import { fauna } from '../../../services/fauna';

import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { session } from 'next-auth/client';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
  callbacks: {
    async session(session){//Premite inserir dados dentro do Session

      try{
        const useActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection(
              [
                q.Match(
                  q.Index('subscription_by_user_ref'),
                  q.Select(
                    "ref",
                    q.Get(
                      q.Match(
                        q.Index('user_by_email'),
                        q.Casefold(session.user.email)
                      )
                    )
                  )
                ),
                q.Match(
                  q.Index('subscription_by_status'),
                  "active"
                )
              ]
            )
          )
        )
        
        return {
          ...session,
          activeSubscripton: useActiveSubscription
        };
      }catch{
        return {
          ...session,
          activeSubscripton: null
        };
      }

    },
    async signIn(user) {
      const { email } = user;
      try{
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(email)//Vai permirtir tanto LowerCase ou UperCase
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(email)
              )
            )
          )
        )
        return true
      }catch{
        return false
      }
    }
  }
})