import { useState } from 'react';
import { CommentWithUser } from '../../models';
import { commentService } from '../../services';
import { userService } from '../../services';

/**
 * Props for the CommentItem component
 * @interface CommentItemProps
 * @property {CommentWithUser} comment - The comment to display, including user information
 * @property {Function} onUpdate - Callback function to be called when the comment is updated or deleted
 */
interface CommentItemProps {
  comment: CommentWithUser;
  onUpdate: () => void;
}

/**
 * Component for displaying a single comment with edit and delete functionality
 * 
 * This component renders a comment with the author's username, creation date, and text.
 * If the current user is the author of the comment or an admin, edit and delete buttons are displayed.
 * The component handles the UI state for editing and deleting comments, and calls the appropriate
 * service methods to perform these operations.
 * 
 * @component
 * @example
 * ```tsx
 * const comment = {
 *   id: '1',
 *   movie_id: 'movie1',
 *   user_id: 'user1',
 *   text: 'Great movie!',
 *   created_at: new Date(),
 *   updated_at: new Date(),
 *   user: {
 *     id: 'user1',
 *     username: 'johndoe'
 *   }
 * };
 * 
 * const handleUpdate = () => {
 *   // Refresh comments or update UI
 * };
 * 
 * <CommentItem comment={comment} onUpdate={handleUpdate} />
 * ```
 */
export const CommentItem = ({ comment, onUpdate }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUser = userService.getCurrentUser();

  // Check if the current user is the author or an admin
  const canModify = currentUser && (
    currentUser.id === comment.user_id ||
    currentUser.isAdmin
  );

  /**
   * Formats a date for display
   * @param {Date} date - The date to format
   * @returns {string} The formatted date string
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Handles clicking the edit button
   * Sets the component to editing mode and initializes the edit text with the current comment text
   */
  const handleEdit = () => {
    setIsEditing(true);
    setEditText(comment.text);
  };

  /**
   * Handles canceling the edit operation
   * Exits editing mode without saving changes
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  /**
   * Handles saving the edited comment
   * Calls the commentService to update the comment in the backend
   * @async
   */
  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    try {
      await commentService.updateComment(comment.id, { text: editText });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update comment:', error);
      // In a real app, you would show an error message to the user
    }
  };

  /**
   * Handles clicking the delete button
   * Sets the component to deleting mode, showing a confirmation dialog
   */
  const handleDelete = () => {
    setIsDeleting(true);
  };

  /**
   * Handles confirming the delete operation
   * Calls the commentService to delete the comment from the backend
   * @async
   */
  const handleConfirmDelete = async () => {
    try {
      await commentService.deleteComment(comment.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setIsDeleting(false);
      // In a real app, you would show an error message to the user
    }
  };

  /**
   * Handles canceling the delete operation
   * Exits deleting mode without deleting the comment
   */
  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

  return (
    <div className="border-b border-gray-200 py-4">
      {isDeleting ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700 mb-4">Are you sure you want to delete this comment?</p>
          <div className="flex space-x-2">
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="font-medium text-blue-600">{comment.user.username}</div>
              <span className="mx-2 text-gray-400">•</span>
              <div className="text-sm text-gray-500">{formatDate(comment.created_at)}</div>
            </div>

            {canModify && !isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="text-gray-500 hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!editText.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-gray-700">{comment.text}</p>
          )}
        </>
      )}
    </div>
  );
};
