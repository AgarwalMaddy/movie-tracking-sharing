import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SearchDialog } from "./search-dialog"

export function AddTitleButton() {
  return (
    <SearchDialog>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Add Title
      </Button>
    </SearchDialog>
  )
}
