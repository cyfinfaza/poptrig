import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://nfiegrdqilamficunshm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODMwOTI0OSwiZXhwIjoxOTUzODg1MjQ5fQ.qnx6mkflTYFTOgiPNCnZkN4Yn_trvyE9QRmGWvwkt_c"

export default createClient(supabaseUrl, supabaseAnonKey)