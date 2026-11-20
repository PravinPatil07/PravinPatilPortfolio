import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getGithubData = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchGithubData } = await import("./github.server");
  const { PROFILE } = await import("./profile");
  return fetchGithubData(PROFILE.githubUser);
});

export const getContributions = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchContributions } = await import("./github.server");
  const { PROFILE } = await import("./profile");
  return fetchContributions(PROFILE.githubUser);
});

export const getRepoDetail = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ repo: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { fetchRepoDetail } = await import("./github.server");
    const { PROFILE } = await import("./profile");
    return fetchRepoDetail(PROFILE.githubUser, data.repo);
  });

export const getHfData = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchHfData } = await import("./hf.server");
  const { PROFILE } = await import("./profile");
  return fetchHfData(PROFILE.hfUser);
});
