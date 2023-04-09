import "dotenv/config";

import { IgApiClient, Feed } from "instagram-private-api";

const ig = new IgApiClient();

ig.state.generateDevice(process.env.IG_USERNAME as string);

(async () => {
  try {
    await ig.account.login(
      process.env.IG_USERNAME as string,
      process.env.IG_PASSWORD as string
    );

    const followersFeed = ig.feed.accountFollowers(ig.state.cookieUserId);
    const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);

    const followers = await getAllItemsFromFeed(followersFeed);
    const following = await getAllItemsFromFeed(followingFeed);

    const followersUsername = new Set(
      followers.map(({ username }) => username)
    );

    const notFollowingBack = following.filter(
      ({ username }) => !followersUsername.has(username)
    );

    for (const user of notFollowingBack) {
      await ig.friendship.destroy(user.pk);
      console.log(`Unfollowed ${user.username}`);

      const time = Math.round(Math.random() * 6000) + 1000;
      await new Promise((resolve) => setTimeout(resolve, time));
    }
  } catch (error) {
    console.error(error);
  }
})();

async function getAllItemsFromFeed<T>(feed: Feed<any, T>): Promise<T[]> {
  let items: any[] | PromiseLike<T[]> = [];
  do {
    items = items.concat(await feed.items());
  } while (feed.isMoreAvailable());
  return items;
}
