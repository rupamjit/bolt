import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, getProjectById, getProjects } from "../actions";

export const useGetProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: string) => createProject(value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["status"] });
    },
  });
};

export const useGetProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
  });
};
