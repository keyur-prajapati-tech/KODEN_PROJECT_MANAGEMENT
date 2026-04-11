import prisma from "../configs/prisma.js";


//Get All workspace for user
export const getUserWorkspaces = async (req, res) => {
    try{
        const {userId} = await req.auth();

        if(!userId){
            return res.status(401).json({ message: "Unauthorized" })
        }

        const workspaces = await prisma.workspace.findMany({
            where:{
                members: {some: { userId: userId}}
            },
            include:{
                members: {include: {user: true}},
                projects:{
                    include:{
                        tasks: {include: {assignee: true, comments: {include: {user: true}}}},
                        members: {include: {user: true}}
                    }
                },
                owner: true
            }
        });
        res.json(workspaces);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

//Add member to workspace
export const addMemberToWorkspace = async (req, res) => {
    try{
        const {userId} = await req.auth();
        const {email, role, workspaceId, message} = req.body;

        // ✅ Basic validation
        if (!email || !role || !workspaceId) {
            return res.status(400).json({
                message: "Email, role and workspaceId are required"
            });
        }

        // check if user exists
        const user = await prisma.user.findUnique({where: {email}});

        if(!user){ return res.status(404).json({ message: "User Not Found" }) }

        if(!workspaceId || !role){ return res.status(400).json({ message: "Missing required parameters" }) }

        if(!["ADMIN", "MEMBER"].includes(role)){
            return res.status(400).json({ message: "Invalid role" })
        }

        // fetch workspace
        const workspace = await prisma.workspace.findUnique({where: {id: workspaceId}, include: {members: true}})

        if(!workspace){
            return res.status(404).json({ message: "Workspace Not Found" });
        }

        // Check creatore has admin role
        if(!workspace.members.find((member) => member.userId === userId && member.role === "ADMIN")){
            return res.status(401).json({ message: "You Do Not Have Admin Privileges" });
        }

        //check if user is already a member
        const existingMember = workspace.members.find((member) => member.userId === userId);

        if(existingMember){
            return res.status(400).json({ message: "User Is already a member" })
        }

        const member = await prisma.workspaceMember.create({
            data:{
                userId: user.id,
                workspaceId,
                role,
                message
            }
        })

        res.json({member, message: "Member added successfully...!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }   
}